## **Usability Test Plan: Screen Studio POC v1 (Revised)**

### 1. Goals & Objectives

This test aims to evaluate the core data-driven workflow and UI clarity of the Screen Studio proof of concept. We want to understand if the primary path for building a form is intuitive, efficient, and aligns with users' mental models.

**Primary Learning Goals:**

1.  **Core Workflow Validation:** Can users efficiently complete the fundamental form-building loop: finding data, adding fields, re-ordering, deleting, and undoing changes?
2.  **Validating the Data-First Model:** Do users understand and successfully use the data entity navigator to find and add fields from related entities?
3.  **UI/UX Discoverability & Preference:** Are key features like settings easily discoverable? What are users' preferences on key UI variations (e.g., toolbar density)?
4.  **Overall Impression:** Does the tool feel logical and empower users to build forms confidently?

### 2. Target Participants

*   **Profile:** Business Analysts, Implementation Specialists, or Product Managers responsible for designing or configuring forms in enterprise software. They are technically proficient but not necessarily developers.
*   **Number of Participants:** 5-7

### 3. Methodology

*   **Method:** Remote, Moderated 1-on-1 Sessions
*   **Duration:** 30-45 minutes per session
*   **Tools:** Video conferencing software, a link to the interactive POC.

---

### 4. Moderator's Introduction Script

"Hi [Participant Name], thank you so much for your time today. My name is [Your Name], and I'll be guiding you through this session.

Today, we'll be looking at an early prototype for a new tool called Screen Studio, which is designed to help people build data-entry screens. Because this is an early concept, some things might not be fully functional, and that's perfectly okay.

The most important thing to know is that **we're testing the prototype, not you.** There are no right or wrong answers, and you absolutely cannot do anything wrong. Your honest feedback is the most valuable thing you can give us, as it will help us make the product better.

To help us understand your thought process, I'm going to ask you to **think aloud as much as possible.** Please tell me what you're looking at, what you're trying to do, and what you expect to happen. It might feel a bit strange at first, but it's incredibly helpful for us.

Finally, please know that this session will be recorded for our internal team to review. Do you have any questions before we get started?"

---

### 5. Scenario: Core Form-Building Workflow

**Introduction:** "Imagine you're building a screen for police officers to file an arrest report. We'll start by adding the key fields related to the arrest itself. Please remember to think aloud as you go."

*   **Task 1: Add Fields**
    *   "First, please add the **Arrest Date** field to the main screen area."
    *   "Next, find and add the **Arresting Agency File Number**."
    *   *(Observe: Do they naturally use the "Data fields" tab? How easily do they understand the concept of the selected "Arrest" node?)*

*   **Task 2: Re-order Field**
    *   "The requirements have changed. Please move the **Arresting Agency File Number** so it appears *above* the **Arrest Date**."
    *   *(Observe: Is drag-and-drop intuitive? Do they discover the drag handle on the selection toolbar?)*

*   **Task 3: Delete & Undo**
    *   "We've decided not to include the Arresting Agency File Number after all. Please remove it from the screen."
    *   "Actually, that was a mistake. Can you bring that field back using a single action?"
    *   *(Observe: Do they find the delete button? Do they think to use Undo? Do they use the keyboard shortcut or the main menu? Does the undo toast message provide clear feedback?)*

*   **Task 4: Navigate to Related Entities**
    *   "Now you need to add information about the charges related to the **victim**. Find the **Arrest Charges** and add a field from there."
    *   *(Observe: This is a key task. Do they use the navigator to go from 'Arrest' to 'Victim' and then to 'Arrest Charges'? Is the navigator's concept of "Last," "Selected," and "Related" nodes clear?)*

*   **Task 5: Search for a Field**
    *   "You know there's a 'Booking Number' field in the Arrest entity, but you don't see it in the list. Find and add the **Booking Number** field to the canvas."
    *   *(Observe: Do they discover and use the search bar? Does it effectively filter the list?)*

*   **Task 6: Rename the Form**
    *   "The title of this form is currently 'Dave's Form'. Please change it to **'Official Arrest Report'**."
    *   *(Observe: Do they find the edit icon next to the name? Is the popover editor intuitive?)*

*   **Task 7: Configure Settings**
    *   "Finally, navigate to the main settings page for this screen."
    *   "On this page, find the setting that controls the **'Save & add another button'** and turn it on."
    *   *(Observe: How easily do they find the main "Settings" tab in the header? How do they navigate the settings page?)*

---

### 6. Post-Scenario UI/UX Evaluation (A/B Test)

**Introduction:** "Great, that completes the main tasks. Now I'd like to get your quick opinion on two different design variations for the interface."

*   **UI Preference 1: Toolbar Layout**
    *   *(Moderator shows the **Normal** toolbar)*: "Here is the first version of the toolbar on the left, with icons and labels."
    *   *(Moderator triggers the **Compact** view)*: "And here is the second version, which is more compact and uses only icons."
    *   **Question:** "Which of these two versions do you prefer, and why?"

*   **UI Preference 2: Data Navigator Breadcrumb**
    *   *(Moderator shows the Data Fields panel **with** the breadcrumb)*: "In this version of the data panel, you can see a full path at the top, like '... > Victim > Arrest Charges'."
    *   *(Moderator triggers the view **without** the breadcrumb)*: "In this other version, that path is hidden."
    *   **Question:** "Which version do you feel is more helpful for understanding where you are? Why?"

---

### 7. Post-Test Debrief & Wrap-up

1.  **Overall Impression:** "Thank you. On a scale of 1 to 5, where 1 is very difficult and 5 is very easy, how would you rate the overall experience of building a form with this tool?"
2.  **Mental Model Probe:** "When you were looking for fields to add, can you describe your thought process? How did you think about finding what you needed?"
3.  **Clarity Probe (Color/Icons):** "Did you notice any color-coding or icons that particularly helped or confused you during the tasks?"
4.  **Expectations:** "Was there anything you expected to be able to do that you couldn't?"
5.  **Most Difficult Task:** "What was the most frustrating or difficult part of the process for you?"
6.  **Final Thoughts:** "If you had a magic wand and could change one thing about this tool, what would it be?"

"This has been incredibly helpful. Your feedback will directly influence how we develop this tool. Thank you again for your time and valuable insights!"