# Unit 05: Related Topics and Subtopic Navigation

## Goal

Turn long lesson documents into a clear zero-to-professional sequence where a
learner always knows the selected topic, the selected subtopic, and what to do
next.

## Behavior

- Show every related topic in the current roadmap phase beside catalog lessons.
- Highlight the active topic and expose completion state without locking other
  topics.
- Provide selectable, numbered subtopics with an explanation, concrete example,
  and focused practice task.
- Make Previous and Next advance through subtopics first, then cross module
  boundaries to the adjacent topic.
- Add an in-lesson subtopic menu and explicit Previous/Next controls to the six
  authored foundation lessons.
- Keep completion independent from navigation so an already-completed lesson
  never becomes a dead end.
- Save the selected topic and subtopic as the learner's current position.

## Detailed Content

- Git and GitHub: 11 subtopics covering mental models, repositories, the working
  tree/index/commit relationship, inspection, branches, merges and conflicts,
  remotes, pull requests, ignore rules, safe recovery, and professional hygiene.
- Terminal and file system: 7 detailed subtopics.
- DNS, URLs and HTTP: 7 detailed subtopics.
- Forms and validation: 6 detailed subtopics.
- JavaScript arrays: 8 detailed subtopics.
- Every other catalog lesson receives a useful topic-aware fallback sequence
  derived from its instructional record and phase guidance.

## Verification

- Browser flow opens Git, confirms the active related-topic state, and advances
  from the first to the second detailed subtopic.
- Browser flow advances a foundation lesson subtopic and crosses into the next
  lesson with the bottom Next control.
- Lint, production build, full persistence smoke flow, and mobile overflow check
  pass.
