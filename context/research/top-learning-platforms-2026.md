# Learning Platform Benchmark — September 2026

## Purpose

This benchmark studies ten established learning products to identify the
learning mechanics Forge should adopt. It evaluates instructional structure,
practice, feedback, adaptation, projects, retention, and evidence of skill.
It does not copy their visual identity or proprietary content.

## Platform Findings

| Platform | Strongest pattern | Forge implication |
|---|---|---|
| Khan Academy | Self-paced practice organized around skill mastery | Separate content completion from demonstrated skill and show the next useful action. |
| Brilliant | Pretesting, visual intuition, interactive problems, immediate feedback, and scaffolding that fades | Ask learners to attempt before explanation; reveal help progressively; finish with independent work. |
| Coursera | Backward-designed objectives, authentic guided projects, worked examples, quizzes, and challenge mode | Align every objective to an observable artifact and increase independence with learner level. |
| DataCamp | Assess → learn → practice → apply cycle with short challenges and real projects | Every topic should end in application and feed evidence back into future practice. |
| Codecademy | Guided practice projects, less-guided challenges, and portfolio projects | Provide a visible ladder from supported execution to open-ended professional work. |
| freeCodeCamp | Short theory, workshops, labs, review pages, quizzes, certification projects, and exams | Use multiple activity types and require projects plus assessments for credentials. |
| Duolingo | Bite-sized progression, adaptive difficulty, mistake review, active recall, and spaced repetition | Revisit weak skills at increasing intervals and keep daily sessions focused. |
| Pluralsight | Skill baselines, curated paths, secure labs, challenge mode, and criterion-based validation | Diagnose where to start; pair instruction with labs and validate against explicit criteria. |
| Udemy | A relevant practice activity in every section with needed resources and connection to goals | Never leave a teaching section without an application, success criteria, and context. |
| edX | Flexible paths combined with practice, application, reflection, authentic assessment, and community | Make reflection and transfer part of learning rather than optional extras. |

## Shared Product Model

The strongest common loop is:

```text
Diagnose → Learn → Predict → Practise → Receive feedback
         → Apply → Debug → Build → Reflect → Review → Validate
```

The platforms differ in subject and presentation, but converge on six rules:

1. Active work must outweigh passive consumption.
2. The learner should try before seeing the complete explanation.
3. Guidance should fade as competence increases.
4. Practice must transfer to a changed or realistic context.
5. Retention requires recall spaced over time, especially after mistakes.
6. Mastery claims require criterion-based evidence, not time watched or a checkbox.

## Forge Gap Analysis

Forge already has a broad curriculum, deep-dive prediction, notes, practice,
projects, reviews, interviews, quizzes, and certificates. The largest remaining
gap is a topic-level progression that joins these pieces and captures evidence
at increasingly professional levels.

### Selected implementation

Add a persistent five-level Mastery Studio to every catalog topic:

1. Foundation — explain the concept and purpose.
2. Guided — trace and annotate a worked example.
3. Applied — build or design a normal and edge case.
4. Debug — diagnose a failure from evidence.
5. Professional — make and defend a production trade-off.

Each level has an outcome, task, success criteria, optional coaching, and a
saved learner artifact. Submission is evidence of work, not automatic proof of
mastery. Formal mastery continues to require assessments, projects, reviews,
and interview evidence.

## Primary Sources

- [Khan Academy — About](https://www.khanacademy.org/about/credits)
- [Brilliant — About and learning approach](https://brilliant.org/about/)
- [Coursera — Pedagogy of Guided Projects](https://blog.coursera.org/coursera-white-paper-details-the-pedagogy-underlying-guided-projects-on-coursera/)
- [DataCamp — Assess, learn, practice, apply](https://www.datacamp.com/blog/online-learning-and-pedagogy-at-datacamp)
- [Codecademy — Project guidance levels](https://www.codecademy.com/resources/blog/which-type-of-project-is-right-for-me/)
- [freeCodeCamp — Curriculum challenge structure](https://contribute.freecodecamp.org/how-to-work-on-coding-challenges/)
- [Duolingo — Teaching method](https://blog.duolingo.com/duolingo-teaching-method/)
- [Pluralsight — Learning paths](https://www.pluralsight.com/product/paths)
- [Udemy — Practice activity standards](https://support.udemy.com/hc/en-us/articles/229605248-Practice-activities-Quality-standards)
- [edX — Successful online learning](https://www.edx.org/resources/tips-for-successful-online-learning)

