## Purpose

Lets users send cute "ping" messages to each other in real time and see incoming pings rendered as floating kawaii animations, with an automatic "pong" delivery acknowledgement.

## ADDED Requirements

### Requirement: Choose a ping emoji
The system SHALL let a user choose which emoji to send from a small fixed palette of cute emojis.

#### Scenario: Select an emoji
- **WHEN** a user picks one of the available palette emojis
- **THEN** that emoji is used for subsequent pings until the user picks another

#### Scenario: Palette only
- **WHEN** a user sends a ping
- **THEN** the emoji sent is always one from the fixed palette (the system never offers free-form emoji input)

### Requirement: Send a ping
The system SHALL allow a user to send a cute ping to the other participants in the session by tapping the ping canvas.

#### Scenario: Tap to ping
- **WHEN** a user taps the ping canvas during a session with at least one other participant present
- **THEN** the system broadcasts a ping carrying the currently selected palette emoji to the other participants

#### Scenario: No peers present
- **WHEN** a user taps the ping canvas while no other participant is present
- **THEN** the system shows a cue that no one is here to receive the ping and does not broadcast

### Requirement: Validate incoming pings
The system SHALL accept only well-formed ping/pong messages and ignore anything else.

#### Scenario: Valid message
- **WHEN** a message with a recognized type, a known sender id, a timestamp, and an emoji from the fixed palette is received
- **THEN** the system processes it as a ping or pong

#### Scenario: Invalid message
- **WHEN** a message with an unrecognized shape, type, or an emoji outside the palette is received
- **THEN** the system ignores it without rendering or broadcasting

### Requirement: Receive and display a ping
The system SHALL display a validated incoming ping to the receiving user as a floating kawaii animation.

#### Scenario: Incoming ping
- **WHEN** a valid ping is received from another participant
- **THEN** the system renders a floating emoji animation that is visible on the receiving user's screen

### Requirement: Automatic pong delivery acknowledgement
The system SHALL automatically send a pong back to the sender when a ping is received, and the sender SHALL treat the ping as delivered rather than seen.

#### Scenario: Auto-pong on receive
- **WHEN** a user receives a valid ping from another participant
- **THEN** the system sends a pong back to that sender, and the sender shows a "delivered" acknowledgement

#### Scenario: Missing pong
- **WHEN** a sender does not receive a pong (for example, the receiver's tab is backgrounded)
- **THEN** the sender treats delivery as unknown rather than unseen

### Requirement: Own pings are not echoed
The system SHALL NOT deliver a user's own ping back to them as if it came from another participant.

#### Scenario: No self-echo
- **WHEN** a user sends a ping
- **THEN** the sender does not receive their own ping as an incoming message from the session

### Requirement: Limit ping rate
The system SHALL throttle outgoing pings to prevent flooding.

#### Scenario: Rapid taps
- **WHEN** a user taps repeatedly within a short interval
- **THEN** the system coalesces the taps so only a bounded number of pings are broadcast per second

### Requirement: Honor reduced-motion preference
The system SHALL reduce or disable the floating animations when the user prefers reduced motion.

#### Scenario: prefers-reduced-motion
- **WHEN** a user's device signals a reduced-motion preference
- **THEN** the system renders a static, non-animated ping indicator instead of a floating animation
