package com.medicare.clinic.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.*;

/**
 * GeminiService — wraps Google Gemini REST API.
 *
 * Rate-limit strategy (free tier = 15 RPM):
 *  • LRU response cache (last 100 unique prompt+message pairs).
 *  • On 429 (either HTTP-level or JSON-level): auto-retry twice with 15-second gaps.
 *  • WebClientResponseException.TooManyRequests (HTTP 429) correctly caught and retried.
 */
@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final WebClient webClient = WebClient.create();
    private final ObjectMapper mapper = new ObjectMapper();

    // ── LRU Response Cache ────────────────────────────────────────────────────
    private final Map<String, String> responseCache = new java.util.LinkedHashMap<>() {
        @Override
        protected boolean removeEldestEntry(Map.Entry<String, String> eldest) {
            return size() > 100;
        }
    };

    // ── Public chat() — called by all agents ─────────────────────────────────
    public String chat(String systemPrompt, String userMessage) {
        String cacheKey = Integer.toHexString((systemPrompt + "|" + userMessage).hashCode());
        if (responseCache.containsKey(cacheKey)) {
            System.out.println("[GeminiService] Cache HIT — skipping API call");
            return responseCache.get(cacheKey);
        }

        int maxRetries = 3;
        int retryWaitSeconds = 15;

        for (int attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                String result = callApi(systemPrompt, userMessage);
                responseCache.put(cacheKey, result);
                return result;

            } catch (RateLimitException e) {
                System.out.println("[GeminiService] 429 on attempt " + attempt + "/" + maxRetries);
                if (attempt < maxRetries) {
                    System.out.println("[GeminiService] Waiting " + retryWaitSeconds + "s before retry...");
                    sleep(retryWaitSeconds * 1000L);
                    retryWaitSeconds += 5; // back off a little more each retry
                } else {
                    return "⏳ **The AI is temporarily unavailable** (rate limit reached).\n\n"
                         + "Please wait **30 seconds** and try again.\n\n"
                         + "> *Tip: The free Gemini plan allows 15 requests/minute. "
                         + "For higher limits, generate a new API key at [aistudio.google.com](https://aistudio.google.com).*";
                }

            } catch (Exception e) {
                System.out.println("[GeminiService] Error on attempt " + attempt + ": " + e.getMessage());
                if (attempt == maxRetries) {
                    return "Agent error: " + e.getMessage();
                }
                sleep(2000);
            }
        }
        return "Service is busy right now. Please try again in a moment.";
    }

    // ── Internal API call ─────────────────────────────────────────────────────
    private String callApi(String systemPrompt, String userMessage) throws Exception {
        Map<String, Object> request = Map.of(
                "system_instruction", Map.of(
                        "parts", List.of(Map.of("text", systemPrompt))),
                "contents", List.of(
                        Map.of(
                                "role", "user",
                                "parts", List.of(Map.of("text", userMessage)))));

        String rawResponse;
        try {
            rawResponse = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .header("Content-Type", "application/json")
                    .bodyValue(mapper.writeValueAsString(request))
                    .retrieve()
                    // ── KEY FIX: intercept HTTP-level 429 before WebClient throws ──
                    .onStatus(
                        status -> status.value() == 429,
                        response -> response.bodyToMono(String.class)
                            .map(body -> new RateLimitException("HTTP 429: " + body))
                            .flatMap(ex -> reactor.core.publisher.Mono.error(ex))
                    )
                    .bodyToMono(String.class)
                    .block();

        } catch (RateLimitException e) {
            // re-throw so caller can retry
            throw e;
        } catch (WebClientResponseException e) {
            // Other HTTP errors (400, 403, 500 etc.)
            int code = e.getStatusCode().value();
            if (code == 429) throw new RateLimitException("WebClient 429: " + e.getMessage());
            throw new RuntimeException("HTTP " + code + ": " + e.getMessage());
        }

        System.out.println("=== GEMINI RAW RESPONSE ===");
        System.out.println(rawResponse);
        System.out.println("===========================");

        if (rawResponse == null || rawResponse.isBlank()) {
            throw new Exception("Empty response from Gemini API");
        }

        var root = mapper.readTree(rawResponse);

        // JSON-level error (e.g. invalid key, quota exceeded returned as 200 with error body)
        var errorNode = root.path("error");
        if (!errorNode.isMissingNode()) {
            int code = errorNode.path("code").asInt(0);
            String errMsg = errorNode.path("message").asText("Unknown API error");
            System.out.println("GEMINI API ERROR [" + code + "]: " + errMsg);
            if (code == 429 || errMsg.toLowerCase().contains("quota") || errMsg.toLowerCase().contains("rate")) {
                throw new RateLimitException("JSON error 429: " + errMsg);
            }
            throw new Exception("Gemini API error " + code + ": " + errMsg);
        }

        // Parse candidates
        var candidates = root.path("candidates");
        if (candidates.isMissingNode() || candidates.isEmpty()) {
            throw new Exception("No candidates in Gemini response");
        }

        var partsNode = candidates.get(0).path("content").path("parts");
        if (partsNode.isMissingNode() || partsNode.isEmpty()) {
            throw new Exception("No parts in Gemini response");
        }

        String text = partsNode.get(0).path("text").asText("");
        if (text.isEmpty()) {
            throw new Exception("Empty text in Gemini response");
        }

        return text;
    }

    private void sleep(long ms) {
        try { Thread.sleep(ms); } catch (InterruptedException ie) { Thread.currentThread().interrupt(); }
    }

    // Typed exception so retry logic is clean
    public static class RateLimitException extends RuntimeException {
        public RateLimitException(String msg) { super(msg); }
    }
}