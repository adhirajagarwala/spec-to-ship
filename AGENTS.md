# AGENTS.md

## Git Identity — Non-Negotiable

Every commit and push in this repo must be authored as:
  Name:  Adhiraj Agarwala
  Email: adhirajagarwala2007@gmail.com

Before the first commit in any session, run:
  git config user.name "Adhiraj Agarwala"
  git config user.email "adhirajagarwala2007@gmail.com"

Rules:
- Never commit unless git config user.name is exactly Adhiraj Agarwala.
- Never commit unless git config user.email is exactly adhirajagarwala2007@gmail.com.
- Never add Co-Authored-By lines.
- Never add Signed-off-by lines.
- Never add AI/tool/assistant contributor metadata.
- The commit author must be always and only Adhiraj Agarwala.

## Project

This repository is Spec to Ship: a local workflow tool that converts raw notes
into structured product docs and task lists.

## Core Rules

1. Do not generate fake task data or PRD content.
2. Keep the tool lightweight and runnable without external services.
3. Every feature must have tests.
4. Document what the tool does and what it does not do.
