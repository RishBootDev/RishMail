package org.rishbootdev.rishmail.controller;

import lombok.RequiredArgsConstructor;
import org.rishbootdev.rishmail.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Flux;

@RestController
@RequestMapping("api/email")
@RequiredArgsConstructor
@CrossOrigin(origins="*")
public class EmailGeneratorController {

    private final EmailService emailService;


    @GetMapping("/create")
    public ResponseEntity<Flux<String>> generateEmail(
            @RequestParam String emailContent,
            @RequestParam String tone) {

        return ResponseEntity.ok(emailService.generateEmailReply(emailContent,tone));
    }

}
