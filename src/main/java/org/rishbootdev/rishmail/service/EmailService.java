package org.rishbootdev.rishmail.service;


import lombok.RequiredArgsConstructor;
import org.rishbootdev.rishmail.dto.EmailRequest;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailService {

    private final ChatClient chatClient;

    public String generateEmailReply(EmailRequest emailRequest) {
        return "";
    }
}
