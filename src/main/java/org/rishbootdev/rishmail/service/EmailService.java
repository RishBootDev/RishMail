package org.rishbootdev.rishmail.service;


import lombok.AllArgsConstructor;
import org.rishbootdev.rishmail.dto.EmailRequest;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class EmailService {

    private final ChatClient chatClient;

    public String generateEmailReply(EmailRequest emailRequest) {

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

          return " ";
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
