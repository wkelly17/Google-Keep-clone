// ? Reed didn't say too much on why we were using a class to build this app other than convenience.
class App {
  constructor() {
    //~OBJECT DATA

    this.notes = JSON.parse(localStorage.getItem("notes")) || []; //!parses json string to array or creates empty array
    this.title = "";
    this.text = "";
    this.id = "";

    //~   DOM ELEMENTS
    //Reed uses Dollar signs to indicate that the variables here are HTML elements and not stored data.
    this.$placeholder = document.querySelector("#placeholder");
    this.$closeButton = document.querySelector("#form-close-button");
    this.$form = document.querySelector("#form");
    this.$notes = document.querySelector("#notes");
    this.$noteTitle = document.querySelector("#note-title");
    this.$noteText = document.querySelector("#note-text");
    this.$formButtons = document.querySelector("#form-buttons");
    this.$modal = document.querySelector(".modal");
    this.$modalTitle = document.querySelector(".modal-title");
    this.$modalText = document.querySelector(".modal-text");
    this.$modalCloseButton = document.querySelector(".modal-close-button");
    this.$colorTooltip = document.querySelector("#color-tooltip");

    this.render(); //!renders current notes on refresh of browser.
    this.addEventListeners();
    //Here, the 'this' must be added since it is in an object. This method is called in the object so that when instantiated on page load the methods are availabe.
  }

  //* -------------------- ADDING EVENT LISTENERS ------------------------- */

  addEventListeners() {
    //~handling body clicks
    document.body.addEventListener("click", (event) => {
      this.handleFormClick(event);
      this.selectNote(event);
      this.openModal(event);
      this.deleteNote(event);
    });

    // ~ changing note colors
    document.body.addEventListener("mouseover", (event) => {
      this.openTooltip(event);
    });

    document.body.addEventListener("mouseout", (event) => {
      this.closeTooltip(event);
    });

    this.$colorTooltip.addEventListener("mouseover", function () {
      this.style.display = "flex";
    });

    this.$colorTooltip.addEventListener("mouseout", function () {
      this.style.display = "none";
    });

    this.$colorTooltip.addEventListener("click", (event) => {
      const color = event.target.dataset.color;
      if (color) {
        this.editNoteColor(color);
      }
    });

    //~Adding notes on submit button
    this.$form.addEventListener("submit", (event) => {
      event.preventDefault();
      const title = this.$noteTitle.value;
      const text = this.$noteText.value;
      const hasNote = title || text; //this line ensures that at least one of the inputs has a value that isn't null

      if (hasNote) {
        this.addNote({ title, text }); //passed in as a object using object shorthand. i.e. (({ title: title, text: text } Means the parameter order isn't important.  note that title and text as parameters are defined upon click the above 3 lines)
      }
    });
    //~Close form
    this.$closeButton.addEventListener("click", (event) => {
      event.stopPropagation(); //this method stops bubbling up to Handle Formclick() which is on body.
      this.closeForm();
    });

    this.$modalCloseButton.addEventListener("click", (event) => {
      this.closeModal(event);
    });
  }

  //~ Defining methods used in event listeners.
  handleFormClick(event) {
    //This variable returns a boolean.  Does the form contain the target of where the click actually happened?
    const isFormClicked = this.$form.contains(event.target);

    //adding functionality to check inputs to also submit note if clicking away
    const title = this.$noteTitle.value;
    const text = this.$noteText.value;
    const hasNote = title || text;

    if (isFormClicked) {
      this.openForm(); //if a truthy, open it.
    } else if (hasNote) {
      this.addNote({ title, text });
    } else {
      this.closeForm();
    }
  }

  //--------------- OPEN FORM ---------------- */

  openForm() {
    this.$form.classList.add("form-open");
    this.$noteTitle.style.display = "block";
    this.$formButtons.style.display = "block";
  }

  /* ----------- CLOSE FORM ------------------------ */



  closeForm() {
    this.$form.classList.remove("form-open");
    this.$noteTitle.style.display = "none";
    this.$formButtons.style.display = "none";
    this.$noteTitle.value = ""; //clears input fields on close
    this.$noteText.value = "";
  }

  /* -------------------------- OPEN MODAL ------------- */
  openModal(event) {
    //traverses Element and parents looking for supplied selector, returning self or ancestor
    if (event.target.matches(".toolbar-delete")) return;
    if (event.target.closest(".note")) {
      this.$modal.classList.toggle("open-modal");
      this.$modalTitle.value = this.title;
      this.$modalText.value = this.text;
    }
  }

  /* -------------------------- CLOSE MODAL --------------------- */
  closeModal(event) {
    this.editNote();
    this.$modal.classList.toggle("open-modal");
  }

  /* --------- OPEN COLOR TOOLTIP --------- */
  openTooltip(event) {
    if (!event.target.matches(".toolbar-color")) return;
    this.id = event.target.dataset.id;
    //gets sibling ID
    const noteCoords = event.target.getBoundingClientRect();
    //Gets exact location of tooltip
    const horizontal = noteCoords.left + window.scrollX;
    //will place tip relative to where color pallete icon was (and y for y)
    const vertical = noteCoords.top + window.scrollY;
    this.$colorTooltip.style.transform = `translate(${horizontal}px, ${vertical}px)`;
    this.$colorTooltip.style.display = "flex";
  }

  closeTooltip(event) {
    if (!event.target.matches(".toolbar-color")) return;
    this.$colorTooltip.style.display = "none";
  }

  // --------------- ADDNOTE FUNCTION --------------------- */

  addNote(
    { title, text } //destructuring obj param.
  ) {
    //newNote is going to contain an Id, color, title and text. The best way to store related info is in an object
    const newNote = {
      title,
      text,
      color: "white",
      id: this.notes.length > 0 ? this.notes[this.notes.length - 1].id + 1 : 1,
    };
    this.notes = [...this.notes, newNote];
    ////  console.log(this.notes);
    this.render();
    this.closeForm();
  }

  /* -------------------------- EDIT NOTE ------------------------------- */
  editNote() {
    const title = this.$modalTitle.value;
    const text = this.$modalText.value;
    this.notes = this.notes.map((note) =>
      note.id === Number(this.id) ? { ...note, title, text } : note
    );
    this.render();
  }

  editNoteColor(color) {
    this.notes = this.notes.map((note) =>
      note.id === Number(this.id) ? { ...note, color } : note
    );
    this.render();
  }

  // --------------------- SELECTNOTE FUNCTION - ------------------------- */

  selectNote(event) {
    const $selectedNote = event.target.closest(".note");
    if (!$selectedNote) return;
    const [$noteTitle, $noteText] = $selectedNote.children;
    //.children gives array of elements, and places via array destructuring.
    this.title = $noteTitle.innerText;
    this.text = $noteText.innerText;
    this.id = $selectedNote.dataset.id;
  }

  /* --------------------------- DELETE NOTE ------------ */

  deleteNote(event) {
    event.stopPropagation();
    if (!event.target.matches(".toolbar-delete")) return;
    const id = event.target.dataset.id;
    this.notes = this.notes.filter((note) => note.id !== Number(id));
    this.render();
  }

  /* -------------- RENDER FX ------------- */
  // ~ This function allow the 2 in 1 of saving and displaying.
  render() {
    this.saveNotes();
    this.displayNotes();
  }

  /* ------------- SAVE NOTES ------------- */
  saveNotes() {
    localStorage.setItem("notes", JSON.stringify(this.notes));
  }
  /* ------------------- DISPLAY NOTES FUNCTION ------------------------- */

  displayNotes() {
    const hasNotes = this.notes.length > 0; //truthy or falsy
    this.$placeholder.style.display = hasNotes ? "none" : "flex";
    //Ternary to display placeholder or  not

    //~Longer way of writing ternary
    ////`   if (hasNotes) {
    ////`  this.$placeholder.style.display = 'none';
    ////    } else {
    ////      this.$placeholder.style.display = 'flex';
    ////    }
    //// }

    //this maps over each item of the notes array.  For each array item, do the follow callback (i.e the html).
    this.$notes.innerHTML = this.notes
      .map(
        (note) => `
<div style="background: ${note.color};" class="note" data-id="${note.id}">
  <div class="${note.title && "note-title"}">${note.title}</div>
  <div class="note-text">${note.text}</div>
  <div class="toolbar-container">
    <div class="toolbar">
      <img class="toolbar-color" data-id=${
        note.id
      } src="https://icon.now.sh/palette">
      <img data-id=${
        note.id
      } class="toolbar-delete" src="https://icon.now.sh/delete">
    </div>
  </div>
</div>
`
      )
      .join("");
    //this .join removes comma between array elements
  }

  //! closing app bracket
}

new App();
