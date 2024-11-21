declare module 'save-svg-as-png' {
    export function saveSvgAsPng(
        svgElement: SVGElement,
        filename: string,
        options?: {
            scale?: number;
            backgroundColor?: string;
            width?: number;
            height?: number;
        }
    ): void;

    export function svgAsPngUri(
        svgElement: SVGElement,
        options?: {
            scale?: number;
            backgroundColor?: string;
            width?: number;
            height?: number;
        }
    ): Promise<string>;
}
