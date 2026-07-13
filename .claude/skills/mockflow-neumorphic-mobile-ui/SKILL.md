---
name: mockflow-neumorphic-mobile-ui
description: A soft, tactile design style using light and shadow to create extruded plastic-like surfaces for mob... Trigger on: Design, neumorphism, soft ui, mobile, tactile, minimal, shadows.
allowed-tools: mcp__claude_ai_WireframePro__render_wireframe
---

# Neumorphic Mobile UI

## Requirements
- MockFlow WireframePro MCP server (desktop on port 21194 or CLI install via npm)

## Author
MockFlow

## Category
design

## Output Type
wireframe

## Instructions
Design mobile screens using the Neumorphism (soft UI) design language. The background color is a specific mid-light gray (#E0E5EC). All components like cards, buttons, and input fields must use the same color as the background (#E0E5EC) to appear as if they are part of the same surface. Instead of borders, use two distinct shadows to create depth: a light highlight shadow in white (#FFFFFF) on the top-left and a dark shadow in soft gray (#A3B1C6) on the bottom-right. This creates an 'extruded' or 'pressed' effect. Use Source Sans Pro for all text. Primary text is in dark gray (#474747) and accent text is in a soft blue (#6D5DFC). Buttons are rounded rectangles with a 20px corner radius and an extruded look. Active or pressed states should appear sunken into the surface using inner shadows. Top navigation bars should be flat but contain extruded circular buttons for actions. Overall layout should be spacious with a 20px margin, reflecting a modern, tactile mobile application interface.

## Input examples
Describe a mobile screen (e.g. "a mobile smart home controller" or "a mobile music player interface")

## Output
Call the `render_wireframe` MCP tool from MockFlow WireframePro to render the result.
