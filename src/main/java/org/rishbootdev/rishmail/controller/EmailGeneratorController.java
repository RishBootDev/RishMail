package org.rishbootdev.rishmail.controller;

import lombok.RequiredArgsConstructor;
import org.rishbootdev.rishmail.dto.EmailRequest;
import org.rishbootdev.rishmail.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("api/email")
@RequiredArgsConstructor
@CrossOrigin
public class EmailGeneratorController {

    private final EmailService emailService;


    @GetMapping("/hit")
    public ResponseEntity<Flux<String>> generateEmail(@RequestBody EmailRequest emailRequest){
        return ResponseEntity.ok( emailService.generateEmailReply(emailRequest));
    }
    @GetMapping("/create")
    public ResponseEntity<Flux<String>> generateEmail(
            @RequestParam String emailContent,
            @RequestParam String tone) {

        EmailRequest emailRequest = new EmailRequest();
        emailRequest.setEmailContent(emailContent);
        emailRequest.setTone(tone);

        return ResponseEntity.ok(emailService.generateEmailReply(emailRequest));
    }

}
