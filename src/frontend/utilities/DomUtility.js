

export default class DomUtility {
  static stringToHTML(string) {
    if (typeof string !== "string" || string.trim() === "") {
      throw new Error("loadHTML: Input must be a non-empty HTML string.");
    }

    const temp = document.createElement("div");
    temp.innerHTML = string.trim();
    const element = temp.firstElementChild;

    if (!element) {
      throw new Error(
        "loadHTML: Failed to convert HTML string to a DOM element.",
      );
    }
    return element;
  }
}
