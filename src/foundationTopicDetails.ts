export type FoundationTopicDetail = {
  why: string;
  analogy: string;
  steps: string[];
  realWorld: string;
  diagram: string;
  practice: string;
  takeaways: string[];
};

const details: Record<string, FoundationTopicDetail[]> = {
  "day-1-computers": [
    {
      why: "Every program eventually becomes small operations performed by hardware. This model helps you reason about speed, memory, files, input, output, and why a computer does exactly what the instructions say rather than what the author intended.",
      analogy:
        "Think of a very literal kitchen: input is the order, memory is the worktop, the CPU is the cook, storage is the pantry, and output is the finished meal. Unlike a person, the computer never fills in a missing recipe step using common sense.",
      steps: [
        "An input device, file, network request, or another program supplies data.",
        "The operating system places the program instructions and active data in memory.",
        "The CPU repeatedly fetches an instruction, decodes it, and executes the requested operation.",
        "Intermediate values remain in registers or memory while later instructions use them.",
        "The result is displayed, sent over a network, or written to persistent storage.",
      ],
      realWorld:
        "When you press 7 + 4 on a calculator, button presses become input values, instructions add the values, memory holds the result 11, and the screen displays that result. Saving the calculation would copy data to storage so it survives closing the app.",
      diagram:
        "input → memory → CPU fetch/decode/execute\n                    ↓\n             output or storage",
      practice:
        "Trace a music player from pressing Play to hearing sound. Identify the input, stored file, data placed in memory, processing, and output device.",
      takeaways: [
        "Programs are exact instructions",
        "RAM is temporary working space",
        "Storage persists data",
        "Output makes a result observable",
      ],
    },
    {
      why: "An algorithm separates problem-solving from programming-language syntax. If the steps are incomplete or ambiguous, translating them into JavaScript, Python, or any other language will preserve the flaw.",
      analogy:
        "A route is an algorithm: start at a known place, follow ordered turns, and finish at a destination. Code is that route written in a notation a particular machine environment can process.",
      steps: [
        "Define the goal, acceptable inputs, required output, and constraints.",
        "Break the solution into finite, ordered, unambiguous operations.",
        "Test the operations manually with a normal example and an edge case.",
        "Express the algorithm using a programming language's syntax.",
        "A compiler or interpreter and runtime turn the code into executable operations.",
        "Observe the output and revise either the algorithm or implementation when it is wrong.",
      ],
      realWorld:
        "A checkout algorithm validates the cart, calculates a subtotal, applies discounts, adds tax, confirms payment, and creates an order. The same algorithm can be implemented in several languages, but the business sequence remains recognizable.",
      diagram:
        "problem → algorithm → source code → runtime → machine operations → result",
      practice:
        "Write an algorithm for deciding whether an online order receives free shipping. Include an empty cart, an exact threshold value, and an invalid destination.",
      takeaways: [
        "Algorithms describe the solution",
        "Code expresses an algorithm",
        "Runtimes execute language rules",
        "Edge cases should be tested before coding",
      ],
    },
    {
      why: "Tracing makes invisible program state visible. It is one of the fastest ways to understand unfamiliar code, find incorrect assumptions, and explain exactly why a result was produced.",
      analogy:
        "A trace is like recording every balance in a bank ledger after each transaction. You do not guess the final balance; you update the known state one operation at a time.",
      steps: [
        "List each variable and its initial state before the first instruction.",
        "Execute only the current line and record every value that changes.",
        "For an expression, evaluate its inputs before assigning the result.",
        "When a function is called, trace its arguments, local values, and returned result.",
        "Compare the final state and output with the expected result.",
      ],
      realWorld:
        "For a shopping-cart total, trace price = 12 and quantity = 3, evaluate 12 × 3, assign 36 to subtotal, calculate tax, and then display the final amount. A wrong value can be located at the first step where actual state differs from expected state.",
      diagram:
        "line 1: first = 4        first: 4\nline 2: second = 7       second: 7\nline 3: total = 4 + 7    total: 11\nline 4: print(total)     output: 11",
      practice:
        "Create a trace table for price = 8, quantity = 4, discount = 5, and total = price × quantity - discount. Predict the result before running it.",
      takeaways: [
        "Execute one instruction at a time",
        "Record state changes",
        "Find the first incorrect state",
        "Prediction improves debugging skill",
      ],
    },
  ],
  "day-2-web": [
    {
      why: "Most web applications are distributed systems. Understanding the boundary between client and server clarifies where code runs, which data can be trusted, why networks fail, and where security checks belong.",
      analogy:
        "A restaurant guest makes a request, the kitchen performs work using protected resources, and a server returns the result. The guest cannot safely walk into the kitchen and authorize their own payment.",
      steps: [
        "The client constructs a request from a user action or application event.",
        "The network carries the request to the server identified by the URL.",
        "The server authenticates and authorizes the caller when required.",
        "Application code validates input and reads or changes data.",
        "The server creates a response containing status, headers, and an optional body.",
        "The client interprets the response and updates the interface.",
      ],
      realWorld:
        "A banking app may display a transfer form in the browser, but the server must verify the account owner, balance, limits, and duplicate request protection before changing any money.",
      diagram:
        "browser client ── request ──▶ web server ──▶ database\nbrowser client ◀─ response ── web server ◀── result",
      practice:
        "For a weather application, list what belongs in the browser, what belongs on the server, and three ways the network request could fail.",
      takeaways: [
        "Clients request and present",
        "Servers enforce trusted rules",
        "Networks can fail or delay",
        "Responses need explicit status",
      ],
    },
    {
      why: "Loading a page involves multiple protocols and layers. Knowing the sequence lets you diagnose whether a failure comes from the URL, DNS, connection, TLS, HTTP, downloaded resources, or browser rendering.",
      analogy:
        "A domain name is a contact name, DNS finds the phone number, the connection starts the call, HTTP carries the conversation, and rendering turns the response into something visible.",
      steps: [
        "The browser parses the URL into scheme, host, port, path, query, and fragment.",
        "DNS resolves the hostname to a reachable network address, often using caches.",
        "The client opens a transport connection and negotiates TLS for HTTPS.",
        "The browser sends an HTTP request for the document.",
        "The response returns status, headers, and document bytes.",
        "The browser parses HTML, requests dependent resources, calculates layout, and paints pixels.",
      ],
      realWorld:
        "If a page name does not resolve, no HTTP request reaches the application server. If HTML arrives but CSS fails, the document can appear unstyled. Browser Network tools reveal which layer completed and which did not.",
      diagram: "URL → DNS → connection/TLS → HTTP → HTML/CSS/JS → render",
      practice:
        "Open one real page in browser DevTools. Find its document request, status, content type, transferred size, and the first stylesheet request.",
      takeaways: [
        "A URL identifies the target",
        "DNS resolves the host",
        "HTTPS protects transport",
        "Rendering requires multiple resources",
      ],
    },
    {
      why: "HTTP is the shared contract between browser and server. Reading a raw exchange removes framework magic and makes API design, debugging, caching, authentication, and error handling easier to reason about.",
      analogy:
        "An HTTP message resembles a labeled parcel: the request line is the destination and action, headers describe handling instructions, and the body contains the payload.",
      steps: [
        "Choose a method that communicates intent, such as GET to read or POST to create.",
        "Choose a path that identifies the resource and add query parameters only when appropriate.",
        "Add headers describing representation, authentication, caching, and client capabilities.",
        "Send a body when the method needs input data.",
        "Interpret the response status before attempting to parse its body.",
        "Handle success, redirects, client errors, server errors, timeouts, and invalid responses.",
      ],
      realWorld:
        "Creating an order might use POST /orders with a JSON body. A 201 response identifies the created order, a 422 response explains invalid fields, and a 401 response means valid authentication is required.",
      diagram:
        "METHOD /path HTTP/version\nheaders\n\noptional body\n──────────────\nstatus code\nheaders\n\noptional body",
      practice:
        "Design request and response examples for reading a profile, creating a task, submitting invalid input, and requesting a missing record.",
      takeaways: [
        "Methods communicate intent",
        "Status codes communicate outcome",
        "Headers describe metadata",
        "Bodies carry representations",
      ],
    },
  ],
  "day-3-html": [
    {
      why: "HTML gives content a machine-readable structure. Meaningful structure supports browsers, search engines, reader modes, assistive technology, maintainers, and CSS without coupling content to a particular visual design.",
      analogy:
        "HTML is like the outline of a report. A title, headings, paragraphs, lists, and references still communicate meaning even before fonts and colors are applied.",
      steps: [
        "Identify the role of each piece of content before choosing an element.",
        "Create one clear page heading and a logical heading hierarchy.",
        "Group related content into meaningful sections or articles.",
        "Use lists for collections and links for navigation to another location.",
        "Let CSS control appearance instead of choosing elements for their default style.",
      ],
      realWorld:
        "A product page can contain a main heading, product article, feature list, purchase form, related navigation, and footer. That structure remains useful to screen readers and search tools even if the stylesheet fails.",
      diagram:
        "document\n├── header\n├── main\n│   ├── h1\n│   ├── article\n│   └── related section\n└── footer",
      practice:
        "Take a news article and outline it using only element names. Explain why each heading, paragraph, list, link, and section has that role.",
      takeaways: [
        "HTML describes meaning",
        "Structure survives without CSS",
        "Headings form an outline",
        "Choose elements by purpose",
      ],
    },
    {
      why: "A complete document shell gives the browser, search engines, and assistive tools the metadata and boundaries needed to interpret content consistently.",
      analogy:
        "The document shell is like a labeled folder: the outside metadata describes the file, while the body contains the material a reader actually uses.",
      steps: [
        "Declare the HTML5 doctype so the browser uses standards mode.",
        "Set the document language on the root html element.",
        "Place character encoding, viewport metadata, title, and resource links in head.",
        "Place visible and interactive content inside body.",
        "Validate nesting and inspect the browser-created DOM.",
      ],
      realWorld:
        "Without a useful title, browser tabs and search results become unclear. Without a language, a screen reader may use incorrect pronunciation. Without viewport metadata, mobile layout can render at an unexpected scale.",
      diagram:
        "<!doctype html>\nhtml[lang]\n├── head → metadata, title, resources\n└── body → visible page content",
      practice:
        "Build a document shell from memory, then compare it with the lesson example and explain the purpose of every line.",
      takeaways: [
        "Doctype enables standards mode",
        "Language supports interpretation",
        "Head contains metadata",
        "Body contains page content",
      ],
    },
    {
      why: "Elements create the document tree; attributes configure individual elements. Knowing the difference prevents invalid markup and makes DOM selection, accessibility, forms, links, and automation predictable.",
      analogy:
        "An element is a device and its attributes are settings on that device. The device determines the basic job; settings refine how this instance behaves.",
      steps: [
        "Open an element with a tag that identifies its semantic role.",
        "Add only attributes supported by that element or valid global attributes.",
        "Place text or permitted child elements inside it.",
        "Close non-void elements in the correct nesting order.",
        "Inspect the DOM because the browser may repair malformed source.",
      ],
      realWorld:
        "In a link, the a element communicates navigation while href provides the destination. In an image, src identifies the resource while alt provides the text alternative.",
      diagram:
        '<a href="/courses" class="nav-link">Courses</a>\n └ element   └ attributes              └ content',
      practice:
        "Create a link, image, ordered list, and text input. Label every element, attribute name, attribute value, and text node.",
      takeaways: [
        "Elements define structure",
        "Attributes configure instances",
        "Nesting creates the DOM tree",
        "Browser repairs can hide mistakes",
      ],
    },
  ],
  "day-4-semantic-html": [
    {
      why: "Native semantic elements communicate roles and include tested behavior. They reduce custom code, improve keyboard access, create useful landmarks, and make interfaces understandable across input and assistive technologies.",
      analogy:
        "Clear road signs tell every traveler what a place is for. A generic box can look like a button, but a real button announces its job and knows how keyboard activation should work.",
      steps: [
        "Identify whether the user is navigating, submitting data, or triggering an action.",
        "Choose the native element whose purpose matches that interaction.",
        "Organize major regions with header, nav, main, aside, and footer where appropriate.",
        "Verify heading order, accessible names, keyboard focus, and activation.",
        "Add ARIA only when native HTML cannot express the required pattern.",
      ],
      realWorld:
        "A button opens a settings dialog; a link navigates to the settings page. Styling both similarly does not make their behavior interchangeable, especially for keyboard and screen-reader users.",
      diagram:
        "destination change → link\ncurrent-page action → button\nprimary content → main\nmajor navigation → nav",
      practice:
        "Audit ten clickable controls on a page. Classify each as navigation or action and verify its element, keyboard behavior, and accessible name.",
      takeaways: [
        "Purpose determines the element",
        "Native controls include behavior",
        "Landmarks aid navigation",
        "ARIA supplements rather than replaces HTML",
      ],
    },
    {
      why: "A programmatic label gives every form control a persistent accessible name. Placeholders disappear, may have weak contrast, and cannot reliably communicate both a field's identity and formatting instructions.",
      analogy:
        "A label is the permanent name on a drawer; a placeholder is a temporary note inside it. Once something fills the drawer, the note is no longer visible.",
      steps: [
        "Write a visible label that clearly names the information requested.",
        "Give the control a unique id and match it from the label's for attribute.",
        "Use name to define the key included in submitted form data.",
        "Place instructions and format requirements before submission.",
        "Associate validation errors with the field and move focus appropriately.",
      ],
      realWorld:
        "A checkout form needs labels such as Card number and Expiration date, plus separate instructions. Clicking a label should focus its input, and an error should say how to correct the specific value.",
      diagram:
        "visible label ── for/id ──▶ input\n                         ├── name → submitted key\n                         └── error description",
      practice:
        "Build name, email, and password fields. Inspect each accessible name, click every label, submit invalid values, and check that errors remain understandable.",
      takeaways: [
        "Every control needs a name",
        "for and id create association",
        "name controls submission",
        "Errors must explain correction",
      ],
    },
    {
      why: "Text alternatives preserve an image's purpose when it cannot be seen or loaded. Good alt decisions depend on context: the same image may be informative, functional, redundant, or decorative in different places.",
      analogy:
        "Alt text is the useful information you would communicate over a phone call—not a visual inventory of every pixel and not the phrase ‘image of.’",
      steps: [
        "Ask what information or function the image contributes in this exact context.",
        "Describe concise equivalent information for an informative image.",
        "Describe the destination or action for an image used as a control or link.",
        'Use alt="" when nearby content already communicates the same information or the image is decorative.',
        "Provide a longer adjacent explanation for complex charts or diagrams.",
      ],
      realWorld:
        "A product photo may need the product name and distinguishing color. A decorative background flourish needs empty alt. A sales chart needs a short alt plus nearby text explaining the trend and key values.",
      diagram:
        'image purpose?\n├── information → concise equivalent alt\n├── action → describe action/destination\n├── complex data → alt + full explanation\n└── decorative/redundant → alt=""',
      practice:
        "Choose appropriate alternatives for a logo link, employee portrait, decorative divider, warning icon, and quarterly revenue chart. Explain every decision.",
      takeaways: [
        "Context determines alt text",
        "Describe purpose, not pixels",
        "Decorative images use empty alt",
        "Complex visuals need full text equivalents",
      ],
    },
  ],
  "day-5-css": [
    {
      why: "Selectors connect styles to elements, while the cascade decides which rule wins. A clear way of thinking about both prevents rule conflicts and makes large stylesheets easier to change safely.",
      analogy:
        "Several workplace policies may apply to one situation. The cascade is the documented decision process that considers source, importance, specificity, scope, and order instead of choosing randomly.",
      steps: [
        "The browser finds rules whose selectors match an element.",
        "Declarations are compared by cascade origin and importance.",
        "Rules in the relevant cascade layer are compared.",
        "Specificity breaks ties between otherwise competing selectors.",
        "Scoping proximity and source order resolve the remaining ties.",
        "The winning declared value becomes computed and is used for layout and paint.",
      ],
      realWorld:
        "A reusable button class should not require an id selector or repeated !important overrides. Low, intentional specificity and clear component boundaries make variants such as primary, danger, and disabled predictable.",
      diagram:
        "matching rules → origin/importance → layer → specificity → scope/order → computed value",
      practice:
        "Write three competing rules for one button, predict the winner, verify in DevTools, and simplify the selectors so the intended rule wins without !important.",
      takeaways: [
        "Selectors determine matches",
        "Cascade determines winners",
        "Specificity is only one input",
        "DevTools shows overridden rules",
      ],
    },
    {
      why: "Every visible element occupies a rectangular box. Understanding how content, padding, border, margin, and sizing interact prevents mysterious overflow and makes responsive layout calculations predictable.",
      analogy:
        "A shipped item has the product itself, protective padding, a cardboard border, and empty space between neighboring packages. Each layer contributes differently to placement and size.",
      steps: [
        "Content receives the available inline and block space from layout.",
        "Padding adds internal breathing room around content.",
        "Border wraps the padding and content and contributes to visible size.",
        "Margin creates external separation from neighboring boxes.",
        "content-box adds padding and border outside declared width; border-box keeps them inside it.",
        "Overflow rules decide what happens when content no longer fits.",
      ],
      realWorld:
        "A 320px card with 24px padding on both sides becomes 368px wide under content-box before borders. On a 360px phone it can overflow. With border-box, the outer border width remains 320px.",
      diagram: "margin\n└─ border\n   └─ padding\n      └─ content",
      practice:
        "Calculate the outer size of content-box and border-box cards, then verify both in the browser's box-model inspector at a narrow viewport.",
      takeaways: [
        "Padding is inside the border",
        "Margin is outside the border",
        "border-box simplifies sizing",
        "Content can still cause overflow",
      ],
    },
    {
      why: "CSS units encode design intent. Relative units adapt to font settings and available space, while rigid values can break under zoom, translation, small screens, or unexpectedly long content.",
      analogy:
        "A fixed-size uniform fits one body; an adjustable design responds to the wearer and situation. The right unit states what a size should respond to.",
      steps: [
        "Use unitless line-height so text spacing scales with font size.",
        "Use rem for sizes that should respect the root text scale.",
        "Use em when a value should scale with the current component's font size.",
        "Use percentages or flexible layout for values relative to a container.",
        "Use viewport units with modern variants and account for browser interface changes.",
        "Use min(), max(), and clamp() when a value needs controlled fluid behavior.",
      ],
      realWorld:
        "A heading can use clamp(2rem, 5vw, 4rem) to grow across screens without becoming unreadably small or enormous. A content panel can use width: min(100% - 2rem, 70rem) to remain fluid with safe edges.",
      diagram:
        "px → fixed CSS reference unit\nrem → root font size\nem → local font size\n% → containing context\nvw/vh → viewport\nclamp → bounded fluid value",
      practice:
        "Replace fixed card width, heading size, and page padding with responsive expressions. Test at 320px, 768px, 1280px, and 200% zoom.",
      takeaways: [
        "Choose units by relationship",
        "Text must survive zoom",
        "Avoid fixed heights for content",
        "Bound fluid values when needed",
      ],
    },
  ],
  "day-6-javascript": [
    {
      why: "Programs operate on values, and bindings give important values names. Choosing const or let deliberately makes state changes visible and reduces the number of possibilities a reader must track.",
      analogy:
        "A value is an item; a variable is a labeled place that refers to an item. const keeps the label attached to the same item, although an object behind that label can still have mutable contents.",
      steps: [
        "An expression produces a value such as a number, string, boolean, object, or undefined.",
        "A declaration creates a binding in the current scope.",
        "Initialization assigns the first value to that binding.",
        "Reading the name retrieves the current referenced value.",
        "let allows later reassignment; const rejects reassignment of the binding.",
        "Block scope controls where let and const names can be accessed.",
      ],
      realWorld:
        "In a checkout calculation, taxRate can remain const while a let retryCount changes after failed requests. Names such as subtotal explain the domain better than short labels such as x.",
      diagram:
        "const taxRate ─────▶ 0.18\nlet retryCount ────▶ 0 → 1 → 2\nconst cart ─────────▶ object (object contents may change)",
      practice:
        "Model a timer using const for configuration and let for changing state. Explain each declaration and identify its scope.",
      takeaways: [
        "Expressions produce values",
        "Bindings name values",
        "Prefer const by default",
        "Scope limits name visibility",
      ],
    },
    {
      why: "Functions create reusable boundaries around behavior. Clear inputs, outputs, and limited responsibility make code easier to test, combine, replace, and reason about independently.",
      analogy:
        "A function is a small machine: parameters are input slots, the body performs a defined transformation, and return sends the result back to the caller.",
      steps: [
        "Define one responsibility and choose a name that describes its result or action.",
        "Declare parameters for the information the function needs from its caller.",
        "Validate or document assumptions at the boundary.",
        "Compute the result with local variables and smaller operations.",
        "Return the value the caller needs; return ends the current call.",
        "Test normal, boundary, and invalid inputs without depending on unrelated global state.",
      ],
      realWorld:
        "A pricing system can separate calculateSubtotal, calculateTax, and calculateTotal. Each function has a small contract and can be tested with representative inputs before it is connected to the interface.",
      diagram: "arguments → parameters → function body → return value → caller",
      practice:
        "Write calculateTip(amount, rate), formatCurrency(value), and createReceipt(amount, tip). Test each alone, then compose them.",
      takeaways: [
        "Parameters receive input",
        "Return provides output",
        "Small functions are easier to test",
        "Avoid hidden global dependencies",
      ],
    },
    {
      why: "JavaScript operations depend on value types and sometimes convert values automatically. Understanding types prevents bugs such as accidental string concatenation, invalid numeric calculations, and truthiness errors.",
      analogy:
        "The symbol + is like a tool with multiple modes. With numbers it adds; with a string present it joins text. You must inspect the materials before predicting what the tool will do.",
      steps: [
        "Identify the primitive or object type of every input at the system boundary.",
        "Remember that browser form values begin as strings unless explicitly converted.",
        "Use explicit parsing or conversion when the domain requires a number or boolean.",
        "Validate conversion results, including NaN and empty input.",
        "Prefer strict equality when comparing values with known types.",
        "Preserve domain meaning instead of converting merely to make an operation succeed.",
      ],
      realWorld:
        "Two form fields containing ‘2’ and ‘3’ produce ‘23’ with + unless they are converted to numbers. Number(value) can convert them, but an empty or malformed value still needs deliberate validation.",
      diagram:
        '2 + 3       → 5       (number addition)\n"2" + "3"   → "23"    (string concatenation)\nNumber("2") → 2       (explicit conversion)',
      practice:
        "Predict and verify ten expressions mixing strings, numbers, booleans, null, and undefined. Replace surprising implicit conversions with explicit domain validation.",
      takeaways: [
        "Operations depend on types",
        "Form values start as strings",
        "Convert explicitly",
        "Validate failed conversion",
      ],
    },
  ],
};

export const getFoundationTopicDetail = (
  lessonId: string,
  tutorialIndex: number,
) => details[lessonId]?.[tutorialIndex];
