## Purpose

Lets two or more people establish a realtime session with each other, either by sharing a session code or by proximity within a chosen radius, and see who is present and whether the connection is live.

## ADDED Requirements

### Requirement: Shared session code matching
The system SHALL allow users to connect by creating or entering a shared session code. A code is a reusable session name, not a single-use token: anyone who knows the code may join or rejoin while the session exists.

#### Scenario: Create a code
- **WHEN** a user opens the app and chooses the code matching mode
- **THEN** the system generates and displays a high-entropy shareable code

#### Scenario: Join via code
- **WHEN** a user enters an existing code
- **THEN** the system joins the same session as anyone else using that code, and all participants appear in the session presence list

#### Scenario: Code is reusable
- **WHEN** a participant leaves and later re-enters the same code
- **THEN** the system reconnects them to the same session (the code remains valid while any participant is connected)

### Requirement: Radius matching
The system SHALL allow a user to connect with everyone whose device is within an approximate radius (~150m or ~1km) of their own location, derived from a geohash cell.

#### Scenario: Join nearby
- **WHEN** a user chooses the nearby mode, grants location access, and selects an approximate radius
- **THEN** the system derives a geohash cell from the user's location and joins the corresponding session

#### Scenario: Location denied
- **WHEN** a user chooses nearby mode but denies location access
- **THEN** the system informs the user that location is required and does not join a nearby session

#### Scenario: Coordinates never leave the device
- **WHEN** a user joins a nearby session
- **THEN** the system sends only the derived geohash cell and never transmits the raw latitude/longitude

### Requirement: Presence
The system SHALL show, in real time, which participants are currently connected to the session.

#### Scenario: Participant joins
- **WHEN** another participant joins the current session
- **THEN** the presence list updates to include that participant without a page reload

#### Scenario: Participant leaves
- **WHEN** a participant disconnects or leaves the session
- **THEN** the presence list updates to remove that participant

### Requirement: Leave session
The system SHALL allow a participant to explicitly leave the current session.

#### Scenario: Leave
- **WHEN** a participant leaves the session
- **THEN** they are removed from the session presence list and stop receiving pings from it

### Requirement: Anonymous identity
The system SHALL identify participants without authentication, using an optional nickname.

#### Scenario: Default identity
- **WHEN** a user opens the app without providing a nickname
- **THEN** the system assigns a stable anonymous identity (a client-generated identifier with a default emoji) and shows it in presence

#### Scenario: Custom nickname
- **WHEN** a user provides a nickname before joining
- **THEN** the system shows that nickname (instead of the default) in the presence list

#### Scenario: Nickname sanitization
- **WHEN** a user provides a nickname that exceeds the maximum length or contains control characters
- **THEN** the system clamps the length and strips control characters before displaying it

### Requirement: Connection status
The system SHALL show whether the realtime connection is live and whether other participants are present.

#### Scenario: Connected with peers
- **WHEN** a user is connected and at least one other participant is present
- **THEN** the system shows a connected indicator and the current participant count

#### Scenario: Alone
- **WHEN** a user is connected but no other participant is present
- **THEN** the system shows that no one else is here yet

#### Scenario: Disconnected
- **WHEN** the realtime connection drops
- **THEN** the system shows a disconnected or reconnecting indicator
