# CareNova — Human & Pet Healthcare Management System

A front-end demonstration project built with HTML5, CSS3, JavaScript, and browser LocalStorage.

## Features

- Patient registration and login with a permanent Patient ID
- Email-based Patient ID recovery
- Multiple permanent Pet IDs linked to one patient
- Human and veterinary provider search
- Appointment requests, history, cancellation, and status tracking
- Admin patient/pet lookup and linked profiles
- Provider creation, editing, and availability management
- Consultation completion and post-consultation feedback
- One 1–5 star rating per completed appointment
- Automatically calculated provider ratings
- Responsive design using CareNova forest-green, ivory, coral, and sage colors

## Setup

Run `setup.ps1` from PowerShell. The script generates the complete CareNova folder and opens it in VS Code.

## Run the website

The setup script starts a local PowerShell HTTP server at:

http://localhost:8765

If the server did not start, open the folder in VS Code and use Live Server, or open `index.html` directly in a browser.

## Demo credentials

- Admin Patient ID: `ADMIN`
- Admin password: `Admin@123`

Register a patient account from the home page to test the patient journey.

## Demo workflow

1. Register a patient and save the generated Patient ID.
2. Sign in using that ID and password.
3. Add a pet profile and save its Pet ID.
4. Book a human or veterinary appointment.
5. Sign in as admin and confirm the appointment.
6. Mark the consultation as Completed.
7. Sign back in as the patient and submit a rating and optional comment.
8. Open the admin feedback tab to view feedback and provider ratings.

## Data and security limitations

This is a hackathon demonstration, not a production healthcare service. Data is stored in browser LocalStorage and is not synchronized across devices. Passwords are stored in plain text for demonstration purposes. The app does not provide server-side authentication, authorization, encryption, medical record compliance, or backups. Do not use real patient data.

The admin account is a seeded demo account. Do not deploy this configuration publicly.
