import { useEffect, useRef } from "react";

import type { VisualizerProps } from "../../../utils/types";

const BAR_COUNT = 32;
const BAR_GAP = 4;
const MIN_BAR_HEIGHT = 4;
const HEIGHT = 96;
const USABLE_BINS = 96; // skip the top bins, which are almost always silent in music

// An <audio> element can only be connected to Web Audio once, so the graph is
// cached per element. This also keeps StrictMode's double effects from breaking it.
const graphs = new WeakMap<HTMLAudioElement, { context: AudioContext; analyser: AnalyserNode }>();

function getGraph(audio: HTMLAudioElement) {
    let graph = graphs.get(audio);

    if (!graph) {
        const context = new AudioContext();
        const source = context.createMediaElementSource(audio);
        const analyser = context.createAnalyser();

        analyser.fftSize = 256; // 128 frequency bins
        analyser.smoothingTimeConstant = 0.8; // bars ease up and down instead of jumping

        source.connect(analyser);
        analyser.connect(context.destination); // keep the audio audible

        graph = { context, analyser };
        graphs.set(audio, graph);
    }

    return graph;
}

export default function Visualizer({ audioRef, isPlaying }: VisualizerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const frameRef = useRef<number | null>(null);
    const isPlayingRef = useRef(isPlaying);

    function draw(data: Uint8Array) {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
        if (!canvas || !ctx) return;

        // Match the canvas resolution to its on-screen size so bars stay sharp.
        const dpr = window.devicePixelRatio || 1;
        const width = canvas.clientWidth;
        if (canvas.width !== width * dpr || canvas.height !== HEIGHT * dpr) {
            canvas.width = width * dpr;
            canvas.height = HEIGHT * dpr;
        }
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.clearRect(0, 0, width, HEIGHT);

        const gradient = ctx.createLinearGradient(0, 0, 0, HEIGHT);
        gradient.addColorStop(0, "#F3D9C7");
        gradient.addColorStop(1, "rgba(167, 139, 250, 0.85)");
        ctx.fillStyle = gradient;

        const barWidth = (width - BAR_GAP * (BAR_COUNT - 1)) / BAR_COUNT;

        for (let i = 0; i < BAR_COUNT; i++) {
            // Spread bars on a curve so the low end doesn't take up the whole width.
            const bin = Math.floor(Math.pow(i / BAR_COUNT, 1.6) * USABLE_BINS);
            const level = (data[bin] ?? 0) / 255;
            const barHeight = Math.max(MIN_BAR_HEIGHT, level * HEIGHT);
            const x = i * (barWidth + BAR_GAP);
            const y = HEIGHT - barHeight;

            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, barWidth / 2);
            ctx.fill();
        }
    }

    useEffect(() => {
        isPlayingRef.current = isPlaying;

        const audio = audioRef.current;
        if (!isPlaying || !audio || frameRef.current !== null) return;

        // Only connect once playback has started: by then the user has clicked
        // something, so the browser allows the AudioContext to run.
        const { context, analyser } = getGraph(audio);
        context.resume();

        const data = new Uint8Array(analyser.frequencyBinCount);

        const loop = () => {
            analyser.getByteFrequencyData(data);
            draw(data);

            // After pausing, keep drawing until the bars have settled, then stop.
            const isSettled = data.every((value) => value < 2);
            if (!isPlayingRef.current && isSettled) {
                frameRef.current = null;
                return;
            }

            frameRef.current = requestAnimationFrame(loop);
        };

        frameRef.current = requestAnimationFrame(loop);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isPlaying]);

    useEffect(() => {
        draw(new Uint8Array(BAR_COUNT)); // resting bars before anything plays

        return () => {
            if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        };
    }, []);

    return (
        <div id="visualizer">
            <canvas
                ref={canvasRef}
                aria-hidden="true"
                style={{ display: "block", width: "100%", height: `${HEIGHT}px` }}
            />
        </div>
    );
}
