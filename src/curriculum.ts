export type CurriculumLesson = {
  id: string;
  day: number;
  phase: string;
  title: string;
  goal: string;
  prerequisites: string;
  minutes: number;
  concepts: string[];
  tutorial: { heading: string; body: string; code?: string }[];
  mistakes: string[];
  exercises: string[];
  quiz: {
    question: string;
    options: string[];
    answer: string;
    explanation: string;
  };
  challenge: string;
  interview: string;
  revision: string[];
};

export const curriculumLessons: CurriculumLesson[] = [
  {
    id: "day-1-computers",
    day: 1,
    phase: "Computer & Web Basics",
    title: "How computers execute instructions",
    goal: "Learn how hardware, software, programs, and data work together before you write code.",
    prerequisites: "None — this lesson starts from zero.",
    minutes: 45,
    concepts: [
      "CPU",
      "memory",
      "storage",
      "input/output",
      "program",
      "algorithm",
    ],
    tutorial: [
      {
        heading: "A computer follows instructions",
        body: "A computer is a machine that accepts input, stores and processes data, and produces output. A program is a precise sequence of instructions. The CPU executes those instructions; memory holds values currently in use; storage keeps files after power is removed.",
      },
      {
        heading: "Programs turn algorithms into action",
        body: "An algorithm is a finite series of unambiguous steps. Code expresses an algorithm in a programming language. A runtime translates or interprets that code into operations the machine can execute.",
      },
      {
        heading: "Trace a tiny program",
        body: "The program reads two values, adds them in the CPU, stores the result in memory, and sends text to an output device.",
        code: "first = 4\nsecond = 7\ntotal = first + second\nprint(total)  // 11",
      },
    ],
    mistakes: [
      "Thinking the computer understands intent instead of exact instructions",
      "Confusing temporary memory with permanent storage",
      "Trying to memorize syntax before understanding the problem",
    ],
    exercises: [
      "Write steps for making tea so another person cannot misinterpret them.",
      "Classify keyboard, RAM, SSD, and monitor as input, memory, storage, or output.",
      "Trace the values of first, second, and total in the example.",
    ],
    quiz: {
      question:
        "Which component primarily holds values a running program is actively using?",
      options: ["RAM", "SSD storage", "Monitor", "Keyboard"],
      answer: "RAM",
      explanation:
        "RAM is working memory used by active programs. Persistent files belong on storage such as an SSD.",
    },
    challenge:
      "Describe input → processing → output for a calculator in five precise steps.",
    interview: "What is the difference between memory and storage?",
    revision: [
      "Programs are exact instructions",
      "CPU executes operations",
      "RAM is temporary working memory",
      "Storage persists files",
    ],
  },
  {
    id: "day-2-web",
    day: 2,
    phase: "Computer & Web Basics",
    title: "How the web works",
    goal: "Learn how a browser uses URLs, DNS, and HTTP to get a website from a server.",
    prerequisites: "Day 1: programs, memory, input and output.",
    minutes: 60,
    concepts: ["client", "server", "URL", "DNS", "HTTP", "request/response"],
    tutorial: [
      {
        heading: "Client and server",
        body: "Your browser is a client. It requests a resource from a server. The server processes the request and returns a response containing a status, headers, and usually HTML, CSS, JavaScript, JSON, or an image.",
      },
      {
        heading: "From URL to response",
        body: "DNS translates a domain name into an IP address. The browser connects, sends an HTTP request, receives a response, then parses and renders the returned resources.",
      },
      {
        heading: "A real HTTP exchange",
        body: "The method states the intent, the path identifies the resource, and the status describes the result.",
        code: "GET /lessons/day-2 HTTP/1.1\nHost: forge.example\n\nHTTP/1.1 200 OK\nContent-Type: text/html",
      },
    ],
    mistakes: [
      "Calling the internet and the web the same thing",
      "Assuming DNS stores the website",
      "Treating every HTTP response as successful",
    ],
    exercises: [
      "Identify the domain and path in https://example.com/courses/html.",
      "Explain what a 404 response means.",
      "Open browser DevTools Network and inspect one document request.",
    ],
    quiz: {
      question: "What is DNS mainly responsible for?",
      options: [
        "Rendering CSS",
        "Mapping domain names to IP addresses",
        "Storing passwords",
        "Running JavaScript",
      ],
      answer: "Mapping domain names to IP addresses",
      explanation:
        "DNS helps the client find the server address associated with a human-readable domain.",
    },
    challenge: "Draw the journey from typing a URL to seeing a rendered page.",
    interview: "What happens after you type a URL into a browser?",
    revision: [
      "Browser is a client",
      "DNS resolves names",
      "HTTP uses requests and responses",
      "Status codes communicate outcomes",
    ],
  },
  {
    id: "day-3-html",
    day: 3,
    phase: "HTML",
    title: "HTML document structure",
    goal: "Build a valid web page with clear, meaningful HTML structure.",
    prerequisites: "Day 2: browsers and HTTP responses.",
    minutes: 75,
    concepts: ["element", "attribute", "doctype", "head", "body", "nesting"],
    tutorial: [
      {
        heading: "HTML describes meaning",
        body: "HTML is a markup language. Elements identify what content means: a heading, paragraph, link, list, image, or section. The browser builds a document tree from nested elements.",
      },
      {
        heading: "The minimum document",
        body: "The doctype selects modern standards mode. The html element contains the document. Metadata belongs in head; visible content belongs in body.",
        code: '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <title>My first page</title>\n  </head>\n  <body>\n    <h1>Hello, web</h1>\n    <p>I built a valid document.</p>\n  </body>\n</html>',
      },
      {
        heading: "Elements and attributes",
        body: "An element can contain text or other elements. Attributes add configuration such as a link destination, image alternative, language, or identifier. Quote attribute values and close elements correctly.",
      },
    ],
    mistakes: [
      "Using HTML for visual spacing",
      "Skipping the language and page title",
      "Incorrectly nesting elements",
      "Using headings based on size instead of hierarchy",
    ],
    exercises: [
      "Create a page with one heading and two paragraphs.",
      "Add a link with a meaningful label.",
      "Validate that opening and closing tags are correctly nested.",
    ],
    quiz: {
      question: "Where should visible page content normally be placed?",
      options: ["body", "head", "title", "doctype"],
      answer: "body",
      explanation:
        "The body contains the document content presented to the user; head contains metadata.",
    },
    challenge:
      "Build a one-page personal introduction using headings, paragraphs, a list, and a link.",
    interview:
      "What is the difference between an HTML element and an attribute?",
    revision: [
      "HTML communicates structure and meaning",
      "head stores metadata",
      "body stores page content",
      "Correct nesting creates a predictable document tree",
    ],
  },
  {
    id: "day-4-semantic-html",
    day: 4,
    phase: "HTML",
    title: "Semantic and accessible HTML",
    goal: "Build pages that work well for people, keyboards, search engines, and assistive tools.",
    prerequisites: "Day 3: HTML document structure.",
    minutes: 75,
    concepts: [
      "semantic HTML",
      "landmarks",
      "labels",
      "alt text",
      "keyboard access",
    ],
    tutorial: [
      {
        heading: "Use the element that matches the job",
        body: "Semantic elements communicate purpose. Use nav for major navigation, main for primary content, article for self-contained content, and button for an action. Native elements include useful keyboard and accessibility behavior.",
      },
      {
        heading: "Forms need programmatic labels",
        body: "A placeholder is not a label. Connect label and input with for and id so clicking the label focuses the control and assistive technology announces its purpose.",
        code: '<label for="email">Email address</label>\n<input id="email" name="email" type="email" required>',
      },
      {
        heading: "Images need context",
        body: "Write concise alt text when an image communicates information. Use an empty alt attribute for purely decorative images so screen readers can skip them.",
      },
    ],
    mistakes: [
      "Making a clickable div instead of a button",
      "Using placeholder text as the only label",
      "Writing alt text that starts with image of",
      "Adding ARIA when native HTML already solves the problem",
    ],
    exercises: [
      "Replace a clickable div with a button.",
      "Add explicit labels to a login form.",
      "Navigate your page using only Tab, Shift+Tab, Enter, and Space.",
    ],
    quiz: {
      question:
        "Which element should trigger an action inside the current page?",
      options: ["button", "div", "span", "strong"],
      answer: "button",
      explanation:
        "A button has the correct semantics and built-in keyboard activation for an action.",
    },
    challenge:
      "Build an accessible contact form with name, email, message, validation, and a submit button.",
    interview:
      "Why should you prefer native semantic elements over custom div-based controls?",
    revision: [
      "Semantics describe purpose",
      "Native controls include behavior",
      "Every form control needs a label",
      "Accessibility starts in HTML",
    ],
  },
  {
    id: "day-5-css",
    day: 5,
    phase: "CSS",
    title: "CSS foundations and the box model",
    goal: "Use CSS selectors, spacing, and sizing to create a clear and reliable design.",
    prerequisites: "Days 3–4: structured and semantic HTML.",
    minutes: 90,
    concepts: [
      "selector",
      "cascade",
      "specificity",
      "box model",
      "display",
      "units",
    ],
    tutorial: [
      {
        heading: "Rules select and declare",
        body: "A CSS rule selects elements and applies declarations. The cascade resolves competing declarations using origin, importance, specificity, and source order.",
      },
      {
        heading: "Every element has a box",
        body: "Content is surrounded by padding, border, and margin. With border-box, the declared width includes padding and border, which makes layout easier to reason about.",
        code: "*, *::before, *::after { box-sizing: border-box; }\n.card {\n  width: 20rem;\n  padding: 1rem;\n  border: 1px solid #ccc;\n  margin-block: 1rem;\n}",
      },
      {
        heading: "Prefer intentional units",
        body: "Use rem for scalable typography and spacing, percentages for relative widths, and viewport units carefully. Avoid fixed heights for text-heavy content because translated or zoomed text may overflow.",
      },
    ],
    mistakes: [
      "Fighting specificity with !important",
      "Forgetting the box-sizing model",
      "Using margin to align everything",
      "Fixing responsive content with rigid pixel widths",
    ],
    exercises: [
      "Calculate the outer width of a content-box element.",
      "Create a reusable card class.",
      "Use DevTools to inspect computed styles and overridden declarations.",
    ],
    quiz: {
      question: "With box-sizing: border-box, what does width include?",
      options: [
        "Content, padding, and border",
        "Only content",
        "Content and margin",
        "Only padding",
      ],
      answer: "Content, padding, and border",
      explanation:
        "border-box keeps padding and border inside the specified width; margin remains outside.",
    },
    challenge:
      "Style yesterday’s contact form with readable spacing, focus states, and a responsive width.",
    interview: "Explain the CSS box model and how border-box changes sizing.",
    revision: [
      "Cascade resolves competing rules",
      "Specificity is one cascade input",
      "Box model is content → padding → border → margin",
      "border-box simplifies sizing",
    ],
  },
  {
    id: "day-6-javascript",
    day: 6,
    phase: "JavaScript",
    title: "Variables, values, and functions",
    goal: "Write small programs that save values, make decisions, and reuse code.",
    prerequisites: "Days 1–5 and a browser with DevTools.",
    minutes: 90,
    concepts: [
      "const",
      "let",
      "primitive values",
      "expression",
      "function",
      "return",
    ],
    tutorial: [
      {
        heading: "Values and bindings",
        body: "A value is data such as a number, string, or boolean. A variable name refers to a value. Prefer const when the binding will not be reassigned; use let only when reassignment is part of the model.",
      },
      {
        heading: "Functions transform input",
        body: "A function packages behavior. Parameters receive input; return produces output. Keeping functions small and deterministic makes them easier to test.",
        code: "function calculateTotal(price, quantity) {\n  const total = price * quantity;\n  return total;\n}\n\nconsole.log(calculateTotal(12, 3)); // 36",
      },
      {
        heading: "Types affect operations",
        body: "The + operator adds numbers but concatenates strings. Inspect values rather than assuming their type, especially when input comes from HTML forms where values begin as strings.",
      },
    ],
    mistakes: [
      "Using let for every variable",
      "Logging a result instead of returning it",
      "Relying on implicit type conversion",
      "Writing one function that performs many unrelated jobs",
    ],
    exercises: [
      "Write a function that converts minutes to seconds.",
      "Predict the result of 2 + '3'.",
      "Write isAdult(age) so it returns a boolean.",
    ],
    quiz: {
      question: "What is the purpose of return inside a function?",
      options: [
        "Provide a result to the caller",
        "Print to the console",
        "Declare a variable",
        "Repeat the function",
      ],
      answer: "Provide a result to the caller",
      explanation:
        "return ends the current function call and gives a value back to the calling expression.",
    },
    challenge:
      "Build functions that calculate subtotal, tax, and final price for a shopping cart item.",
    interview: "When should you use const instead of let?",
    revision: [
      "Values are data",
      "Variables name values",
      "Functions accept inputs and return outputs",
      "Avoid accidental coercion",
    ],
  },
];
