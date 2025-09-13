package com.sparks.Backend.controller;

import com.sparks.Backend.dto.NoteResponse;
import com.sparks.Backend.entities.Note;
import com.sparks.Backend.entities.User;
import com.sparks.Backend.repository.NoteRepository;
import com.sparks.Backend.repository.UserRepository;
import com.sparks.Backend.config.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    public NoteController(NoteRepository noteRepository, UserRepository userRepository, JwtUtil jwtUtil) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
        this.jwtUtil = jwtUtil;
    }

    //Helper: Extract user from token
    private User getUserFromToken(String token) {
        if (token == null || !token.startsWith("Bearer ")) {
            throw new RuntimeException("Invalid Authorization header");
        }
        String email = jwtUtil.extractEmail(token.substring(7)); // remove "Bearer "
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    //Create Note
    @PostMapping
    public ResponseEntity<?> createNote(@RequestHeader("Authorization") String token,
                                        @RequestBody Note note) {
        User user = getUserFromToken(token);
        note.setUser(user);
        Note saved = noteRepository.save(note);
        return ResponseEntity.ok(new NoteResponse(saved.getId(), saved.getTitle(), saved.getContent()));
    }

    //Get All Notes for Logged-in User
    @GetMapping
    public ResponseEntity<?> getNotes(@RequestHeader("Authorization") String token) {
        User user = getUserFromToken(token);
        List<NoteResponse> notes = noteRepository.findByUserId(user.getId())
                .stream()
                .map(n -> new NoteResponse(n.getId(), n.getTitle(), n.getContent()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(notes);
    }

    //Update Note
    @PutMapping("/{id}")
    public ResponseEntity<?> updateNote(@RequestHeader("Authorization") String token,
                                        @PathVariable Long id,
                                        @RequestBody Note noteData) {
        User user = getUserFromToken(token);
        Optional<Note> noteOpt = noteRepository.findById(id);

        if (noteOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Note note = noteOpt.get();
        if (!note.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not allowed"));
        }

        note.setTitle(noteData.getTitle());
        note.setContent(noteData.getContent());
        Note updated = noteRepository.save(note);

        return ResponseEntity.ok(new NoteResponse(updated.getId(), updated.getTitle(), updated.getContent()));
    }

    //Delete Note
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteNote(@RequestHeader("Authorization") String token,
                                        @PathVariable Long id) {
        User user = getUserFromToken(token);
        Optional<Note> noteOpt = noteRepository.findById(id);

        if (noteOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Note note = noteOpt.get();
        if (!note.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(403).body(Map.of("error", "Not allowed"));
        }

        noteRepository.delete(note);
        return ResponseEntity.ok(Map.of("message", "Note deleted"));
    }
}
