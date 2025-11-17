package org.rishbootdev.rishmail.controller;

import lombok.RequiredArgsConstructor;
import org.rishbootdev.rishmail.dto.EmailRequest;
import org.rishbootdev.rishmail.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/email")
@RequiredArgsConstructor
public class EmailGeneratorController {

    private final EmailService emailService;

    public ResponseEntity<String> generateEmail(@RequestBody EmailRequest emailRequest){
        String response=emailService.generateEmailReply(emailRequest);
        return ResponseEntity.ok(response);
    }

}
