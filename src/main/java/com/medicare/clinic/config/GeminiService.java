package com.medicare.clinic.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient = WebClient.create();
    private final ObjectMapper mapper = new ObjectMapper();

    public String chat(String systemPrompt, String userMessage) {
        int maxRetries = 2; // Keep retries low so it fails fast

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                Map<String, Object> request = Map.of(
                        "system_instruction", Map.of(
                                "parts", List.of(Map.of("text", systemPrompt))),
                        "contents", List.of(
                                Map.of("parts", List.of(
                                        Map.of("text", userMessage)))));

                String rawResponse = webClient.post()
                        .uri(apiUrl + "?key=" + apiKey)
                        .header("Content-Type", "application/json")
                        .bodyValue(mapper.writeValueAsString(request))
                        .retrieve()
                        .bodyToMono(String.class)
                        .block();

                // 👇 ADD THIS — print raw response to Spring Boot console
                System.out.println("=== GEMINI RAW RESPONSE ===");
                System.out.println(rawResponse);
                System.out.println("===========================");

                var root = mapper.readTree(rawResponse);

                // safer parsing with null checks
                var candidates = root.path("candidates");
                if (candidates.isMissingNode() || candidates.isEmpty()) {
                    System.out.println("ERROR: No candidates in response");
                    return "I'm sorry, I couldn't process that. Please try again.";
                }

                String text = candidates.get(0)
                        .path("content")
                        .path("parts")
                        .get(0)
                        .path("text")
                        .asText("");

                if (text.isEmpty()) {
                    System.out.println("ERROR: Empty text in response");
                    return "I'm sorry, I couldn't process that. Please try again.";
                }

                return text;

            } catch (Exception e) {
                System.out.println("GEMINI ERROR (attempt " + attempt + "): " + e.getMessage());

                if (e.getMessage() != null && e.getMessage().contains("429")) {
                    System.out.println("⚠️ GEMINI RATE LIMIT HIT (429)! Please check API quota or wait a minute.");
                    // Free tier only allows 15 requests/minute. Don't block thread for 30s.
                    return "Agent error: AI API Rate Limit Exceeded (429). Please wait a minute and try again.";
                } else {
                    return "Agent error: " + e.getMessage();
                }
            }
        }
        return "Service is busy right now. Please try again.";
    }

    // Add at the top of the class
    private final Map<String, String> responseCache = new LinkedHashMap<>() {
        protected boolean removeEldestEntry(Map.Entry<String, String> eldest) {
            return size() > 50; // keep last 50 responses cached
        }
    };

}