// @vitest-environment jsdom
import { createRef } from "react";
import { render, cleanup, act } from "@testing-library/react";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import Visualizer from "./Visualizer";

// --- Web Audio fake -------------------------------------------------------

// What the analyser reports on the next getByteFrequencyData call.
let analyserLevel = 0;

const audioContexts: FakeAudioContext[] = [];

class FakeAnalyser {
    fftSize = 0;
    smoothingTimeConstant = 0;
    frequencyBinCount = 128;
    connect = vi.fn();
    getByteFrequencyData = vi.fn((data: Uint8Array) => data.fill(analyserLevel));
}

class FakeAudioContext {
    destination = {};
    analyser = new FakeAnalyser();
    source = { connect: vi.fn() };
    createMediaElementSource = vi.fn(() => this.source);
    createAnalyser = vi.fn(() => this.analyser);
    resume = vi.fn().mockResolvedValue(undefined);

    constructor() {
        audioContexts.push(this);
    }
}

// --- canvas fake ----------------------------------------------------------

function makeCtx() {
    return {
        fillStyle: "" as unknown,
        setTransform: vi.fn(),
        clearRect: vi.fn(),
        beginPath: vi.fn(),
        roundRect: vi.fn(),
        fill: vi.fn(),
        createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    };
}

// --- requestAnimationFrame under manual control ---------------------------

let frames = new Map<number, FrameRequestCallback>();
let nextFrameId = 1;

function runFrame() {
    const pending = [...frames.values()];
    frames = new Map();
    act(() => pending.forEach((cb) => cb(performance.now())));
}

describe("Visualizer", () => {
    let ctx: ReturnType<typeof makeCtx>;

    beforeEach(() => {
        analyserLevel = 0;
        audioContexts.length = 0;
        frames = new Map();
        nextFrameId = 1;

        ctx = makeCtx();
        vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(ctx as unknown as CanvasRenderingContext2D);
        vi.stubGlobal("AudioContext", FakeAudioContext);
        vi.stubGlobal("requestAnimationFrame", (cb: FrameRequestCallback) => {
            const id = nextFrameId++;
            frames.set(id, cb);
            return id;
        });
        vi.stubGlobal("cancelAnimationFrame", vi.fn((id: number) => frames.delete(id)));
    });

    afterEach(() => {
        cleanup();
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    // A fresh element per test: the component caches one audio graph per element.
    function setup(isPlaying = false) {
        const audioRef = createRef<HTMLAudioElement>() as { current: HTMLAudioElement | null };
        audioRef.current = document.createElement("audio");
        const utils = render(<Visualizer audioRef={audioRef} isPlaying={isPlaying} />);
        return { ...utils, audioRef };
    }

    it("renders a decorative canvas", () => {
        const { container } = setup();
        const canvas = container.querySelector("#visualizer canvas");

        expect(canvas).not.toBeNull();
        expect(canvas?.getAttribute("aria-hidden")).toBe("true");
    });

    it("draws 32 resting bars on mount", () => {
        setup();

        expect(ctx.clearRect).toHaveBeenCalled();
        expect(ctx.roundRect).toHaveBeenCalledTimes(32);
        // Resting bars use the 4px minimum height.
        expect(ctx.roundRect.mock.calls.every((call) => call[3] === 4)).toBe(true);
    });

    it("does not create an AudioContext before playback starts", () => {
        setup(false);

        expect(audioContexts).toHaveLength(0);
        expect(frames.size).toBe(0);
    });

    it("connects source → analyser → destination when playback starts", () => {
        const { audioRef } = setup(true);
        const [context] = audioContexts;

        expect(audioContexts).toHaveLength(1);
        expect(context.createMediaElementSource).toHaveBeenCalledWith(audioRef.current);
        expect(context.source.connect).toHaveBeenCalledWith(context.analyser);
        expect(context.analyser.connect).toHaveBeenCalledWith(context.destination);
        expect(context.analyser.fftSize).toBe(256);
        expect(context.resume).toHaveBeenCalled();
        expect(frames.size).toBe(1);
    });

    it("draws taller bars from analyser data on each frame", () => {
        setup(true);
        ctx.roundRect.mockClear();
        analyserLevel = 255;

        runFrame();

        expect(ctx.roundRect).toHaveBeenCalledTimes(32);
        // Full-scale data fills the 96px canvas height.
        expect(ctx.roundRect.mock.calls.every((call) => call[3] === 96)).toBe(true);
        expect(frames.size).toBe(1); // keeps looping while playing
    });

    it("reuses the same audio graph when playback restarts", () => {
        const { audioRef, rerender } = setup(true);
        analyserLevel = 0;

        rerender(<Visualizer audioRef={audioRef} isPlaying={false} />);
        runFrame(); // settles and stops the loop
        rerender(<Visualizer audioRef={audioRef} isPlaying={true} />);

        expect(audioContexts).toHaveLength(1);
        expect(audioContexts[0].createMediaElementSource).toHaveBeenCalledTimes(1);
        expect(audioContexts[0].resume).toHaveBeenCalledTimes(2);
    });

    it("keeps animating after pause until the bars settle, then stops", () => {
        const { audioRef, rerender } = setup(true);
        analyserLevel = 200;

        rerender(<Visualizer audioRef={audioRef} isPlaying={false} />);
        runFrame();
        expect(frames.size).toBe(1); // still decaying

        analyserLevel = 0;
        runFrame();
        expect(frames.size).toBe(0); // settled → loop ends
    });

    it("cancels the pending animation frame on unmount", () => {
        const { unmount } = setup(true);

        unmount();

        expect(cancelAnimationFrame).toHaveBeenCalledWith(1);
    });

    it("does nothing when there is no audio element", () => {
        const audioRef = { current: null };

        render(<Visualizer audioRef={audioRef} isPlaying={true} />);

        expect(audioContexts).toHaveLength(0);
    });

    it("skips drawing when no 2D context is available", () => {
        vi.mocked(HTMLCanvasElement.prototype.getContext).mockReturnValue(null);

        expect(() => setup()).not.toThrow();
        expect(ctx.roundRect).not.toHaveBeenCalled();
    });
});
