package org.rishbootdev.rishmail.service;


import lombok.AllArgsConstructor;
import org.rishbootdev.rishmail.dto.EmailRequest;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;

import java.time.Duration;

@Service
@AllArgsConstructor
public class EmailService {

    private final ChatClient chatClient;

    public Flux<String> generateEmailReply(EmailRequest emailRequest) {

        String prompt=buildPrompt(emailRequest);

       String requestBody=String.format("""
               {
                 "contents": [
                   {
                     "parts": [
                       {
                         "text": "%s"
                       }
                     ]
                   }
                 ]
               }
               
               """,prompt);

         return chatClient.prompt(requestBody)
                .stream()
                .content()
                .flatMap(str -> Flux.fromIterable(()->str.chars()
                        .mapToObj(c->String.valueOf((char)c))
                        .iterator()))
                .concatMap(ch -> Mono.just(ch)
                        .delayElement(Duration.ofMillis(10)));

    }
    public String buildPrompt(EmailRequest emailRequest){

        StringBuilder prompt=new StringBuilder();
        prompt.append("Generate a professional email reply for the following email:");
        if(emailRequest.getTone() != null && !emailRequest.getTone().isEmpty()){
            prompt.append("Use a ")
                    .append(emailRequest.getTone())
                    .append(" tone.");
        }
        prompt.append("Original Email: \n").append(emailRequest.getEmailContent());

        return prompt.toString();
    }

}
