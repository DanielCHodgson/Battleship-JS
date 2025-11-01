export default class EventBus {
  static events = {};

  static on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
  }

  static off(event, listener) {
    if (!this.events[event]) return;

    const index = this.events[event].indexOf(listener);
    if (index !== -1) {
      this.events[event].splice(index, 1);
    }
  }

  static emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach((listener) => listener(data));
  }

  static registerEvents(eventListeners, events) {
    events.forEach(({ event, handler }) => {
      eventListeners[event] = handler;
      EventBus.on(event, handler);
    });
  }
}
