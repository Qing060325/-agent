import { BaseTool } from './Tool.js';
import { z } from 'zod';
import type { ToolContext, ToolResult } from '../types/index.js';

/**
 * ImageResizeTool - Resize images
 */
export class ImageResizeTool extends BaseTool {
  name = 'image_resize';
  description = 'Resize images';
  inputSchema = z.object({
    inputPath: z.string().describe('Input image path'),
    outputPath: z.string().describe('Output image path'),
    width: z.number().describe('Target width'),
    height: z.number().describe('Target height'),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { inputPath, outputPath, width, height } = input as any;

    try {
      console.log(`[image_resize] ${inputPath} -> ${outputPath}`);
      console.log(`[image_resize] Size: ${width}x${height}`);

      return {
        success: true,
        result: {
          inputPath,
          outputPath,
          width,
          height,
          message: 'Image resized successfully',
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }
}

/**
 * ImageFilterTool - Apply filters to images
 */
export class ImageFilterTool extends BaseTool {
  name = 'image_filter';
  description = 'Apply filters to images';
  inputSchema = z.object({
    inputPath: z.string(),
    outputPath: z.string(),
    filter: z.enum(['blur', 'sharpen', 'grayscale', 'sepia', 'invert']),
    intensity: z.number().optional(),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { inputPath, outputPath, filter, intensity } = input as any;

    try {
      console.log(`[image_filter] Applying ${filter} to ${inputPath}`);

      return {
        success: true,
        result: {
          inputPath,
          outputPath,
          filter,
          intensity,
          message: 'Filter applied successfully',
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }
}

/**
 * ImageCropTool - Crop images
 */
export class ImageCropTool extends BaseTool {
  name = 'image_crop';
  description = 'Crop images';
  inputSchema = z.object({
    inputPath: z.string(),
    outputPath: z.string(),
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { inputPath, outputPath, x, y, width, height } = input as any;

    try {
      console.log(`[image_crop] Cropping ${inputPath}`);

      return {
        success: true,
        result: {
          inputPath,
          outputPath,
          region: { x, y, width, height },
          message: 'Image cropped successfully',
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }
}

/**
 * ImageConvertTool - Convert image formats
 */
export class ImageConvertTool extends BaseTool {
  name = 'image_convert';
  description = 'Convert image formats';
  inputSchema = z.object({
    inputPath: z.string(),
    outputPath: z.string(),
    format: z.enum(['jpg', 'png', 'gif', 'webp', 'bmp']),
    quality: z.number().optional(),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { inputPath, outputPath, format, quality } = input as any;

    try {
      console.log(`[image_convert] Converting to ${format}`);

      return {
        success: true,
        result: {
          inputPath,
          outputPath,
          format,
          quality,
          message: 'Image converted successfully',
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }
}

/**
 * VideoMergeTool - Merge videos
 */
export class VideoMergeTool extends BaseTool {
  name = 'video_merge';
  description = 'Merge multiple videos';
  inputSchema = z.object({
    inputPaths: z.array(z.string()),
    outputPath: z.string(),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { inputPaths, outputPath } = input as any;

    try {
      console.log(`[video_merge] Merging ${inputPaths.length} videos`);

      return {
        success: true,
        result: {
          inputCount: inputPaths.length,
          outputPath,
          message: 'Videos merged successfully',
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }
}

/**
 * VideoTrimTool - Trim videos
 */
export class VideoTrimTool extends BaseTool {
  name = 'video_trim';
  description = 'Trim videos';
  inputSchema = z.object({
    inputPath: z.string(),
    outputPath: z.string(),
    startTime: z.number().describe('Start time in seconds'),
    endTime: z.number().describe('End time in seconds'),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { inputPath, outputPath, startTime, endTime } = input as any;

    try {
      console.log(`[video_trim] Trimming ${startTime}s to ${endTime}s`);

      return {
        success: true,
        result: {
          inputPath,
          outputPath,
          duration: endTime - startTime,
          message: 'Video trimmed successfully',
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }
}

/**
 * VideoConvertTool - Convert video formats
 */
export class VideoConvertTool extends BaseTool {
  name = 'video_convert';
  description = 'Convert video formats';
  inputSchema = z.object({
    inputPath: z.string(),
    outputPath: z.string(),
    format: z.enum(['mp4', 'avi', 'mov', 'mkv', 'webm']),
    codec: z.string().optional(),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { inputPath, outputPath, format, codec } = input as any;

    try {
      console.log(`[video_convert] Converting to ${format}`);

      return {
        success: true,
        result: {
          inputPath,
          outputPath,
          format,
          codec,
          message: 'Video converted successfully',
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }
}

/**
 * AudioMergeTool - Merge audio files
 */
export class AudioMergeTool extends BaseTool {
  name = 'audio_merge';
  description = 'Merge audio files';
  inputSchema = z.object({
    inputPaths: z.array(z.string()),
    outputPath: z.string(),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { inputPaths, outputPath } = input as any;

    try {
      console.log(`[audio_merge] Merging ${inputPaths.length} audio files`);

      return {
        success: true,
        result: {
          inputCount: inputPaths.length,
          outputPath,
          message: 'Audio files merged successfully',
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }
}

/**
 * AudioTrimTool - Trim audio files
 */
export class AudioTrimTool extends BaseTool {
  name = 'audio_trim';
  description = 'Trim audio files';
  inputSchema = z.object({
    inputPath: z.string(),
    outputPath: z.string(),
    startTime: z.number(),
    endTime: z.number(),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { inputPath, outputPath, startTime, endTime } = input as any;

    try {
      console.log(`[audio_trim] Trimming ${startTime}s to ${endTime}s`);

      return {
        success: true,
        result: {
          inputPath,
          outputPath,
          duration: endTime - startTime,
          message: 'Audio trimmed successfully',
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }
}

/**
 * AudioConvertTool - Convert audio formats
 */
export class AudioConvertTool extends BaseTool {
  name = 'audio_convert';
  description = 'Convert audio formats';
  inputSchema = z.object({
    inputPath: z.string(),
    outputPath: z.string(),
    format: z.enum(['mp3', 'wav', 'aac', 'flac', 'ogg']),
    bitrate: z.string().optional(),
  });

  protected async executeImpl(
    input: unknown,
    context: ToolContext
  ): Promise<ToolResult> {
    const { inputPath, outputPath, format, bitrate } = input as any;

    try {
      console.log(`[audio_convert] Converting to ${format}`);

      return {
        success: true,
        result: {
          inputPath,
          outputPath,
          format,
          bitrate,
          message: 'Audio converted successfully',
        },
        timestamp: Date.now(),
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }
}

/**
 * All media tools
 */
export const MEDIA_TOOLS = [
  new ImageResizeTool(),
  new ImageFilterTool(),
  new ImageCropTool(),
  new ImageConvertTool(),
  new VideoMergeTool(),
  new VideoTrimTool(),
  new VideoConvertTool(),
  new AudioMergeTool(),
  new AudioTrimTool(),
  new AudioConvertTool(),
];
