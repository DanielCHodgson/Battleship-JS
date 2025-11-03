import RenderController from "../RenderController";

const renderController = new RenderController();

describe("RenderController", () => {
  test("render should return 'rendering!'", () => {
    expect(renderController.render()).toBe("rendering!");
  });
});
