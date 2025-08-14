# cal
Take-Home Assignment
Design and Develop a Calendar Booking System (Similar to cal.com)

Introduction
Your task is to design and develop a simple calendar booking system that allows a Calendar
Owner to set up their availability and enables Invitees to book appointments based on that
availability through a set of APIs.

Terminology
1. Calendar Owner: The individual who has an account with the calendar booking system
and whose calendar is available for booking via APIs.
2. Invitee: A person who uses the API to book an appointment with the Calendar Owner.
3. Appointment: A booking made by an Invitee to create a meeting with the Calendar
Owner.

Functional Requirements
1. Calendar Setup by Calendar Owner
- Availability Setup API: Implement an API endpoint that allows the Calendar Owner to
set up their availability rules.
- Availability Rules:
- Define start and end times for availability (e.g., 10:00 AM to 5:00 PM
every day).
- These rules determine the time slots during which an Invitee can book
appointments.
2. Appointment Booking by Invitee
- Search Available Time Slots API: Implement an API endpoint that allows an Invitee to
search for available time slots on a particular date.
- Time Slot Constraints:

- Appointments are 60 minutes in duration.
- Time slots are at 60-minute intervals.
- Valid Slots: 10:00–11:00 AM, 11:00 AM–12:00 PM, 12:00–1:00
PM.
- Invalid Slots: 10:15–11:15 AM, 10:30–11:30 AM, 10:45–11:45
AM.
- Availability Calculation:
- Generate available time slots based on the Calendar Owner's availability
and any existing appointments to prevent double-booking.

- Book Appointment API: Implement an API endpoint that allows an Invitee to book a
specific available time slot.
- Booking Rules:
- Only allow booking of time slots retrieved from the Search Available
Time Slots API.
- Ensure that once a slot is booked, it becomes unavailable for other
Invitees.

3. Appointment Review by Calendar Owner
- List Upcoming Appointments API: Implement an API endpoint that allows the
Calendar Owner to retrieve a list of all their upcoming appointments.
- Details to Include:
- Date and time of each appointment.
- Any relevant details about the Invitee or the appointment.

Assumptions
- Programming Language: You are free to use any programming language and
frameworks you are comfortable with.
- User Management:
- Assume the Calendar Owner is already authenticated in the system.
- No need to implement authentication, authorization, or session management.
- Data Persistence:
- You may use any form of data storage (database, in-memory data structures,
etc.).
- Persistence beyond the runtime of the application is not required; in-memory
storage is acceptable.
- Additional Assumptions:
- Feel free to make reasonable assumptions where requirements are unspecified.
- Document any additional assumptions in your README file.

Non-Functional Requirements
- Code Quality:
- Write clean, readable, and maintainable code.
- Follow best practices and coding standards for your chosen programming
language.
- Modularity:
- Structure your code to be modular and reusable.
- Utilize functions, classes, and design patterns where appropriate.
- Testing:
- Include unit tests for your code to verify that each component functions correctly.
- Ensure tests cover both typical use cases and edge cases.
- Documentation:
- Provide clear documentation for your APIs (e.g., using README files, code
comments, or API documentation tools).
- Include instructions on how to set up and run your application.

Evaluation Criteria
Your submission will be evaluated based on the following:
1. Functional Completeness:
- Implementation of all required features and APIs.
- Correct handling of time slot calculations and bookings.
2. Code Quality and Modularity:
- Cleanliness and organization of code.
- Proper use of programming constructs and design patterns.
3. Testing:
- Presence and quality of unit tests.
- Coverage of different scenarios and edge cases.
4. Design Patterns:
- Appropriate use of design patterns to enhance code structure and maintainability.

5. Best Practices:
- Adherence to coding standards and best practices.
- Effective error handling and input validation.

Submission Instructions
- Deadline: Submit your solution within 7 days of receiving this assignment.
- Repository:
- Create a public or private repository on GitHub or any other Git provider.
- If the repository is private, please share access with the provided contact email.
- Submission Content:
- Source Code: Include all source code files required to run your application.
- README File:
- Provide instructions on how to set up and run your application.
- Document any assumptions, design decisions, and instructions for
running tests.
- Include examples of API requests and responses if applicable.

- How to Submit:
- Send the link to your repository via email to the provided contact person or
through the designated submission platform.

We look forward to reviewing your submission. If you have