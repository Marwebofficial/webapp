
'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GeneratePostInputSchema = z.object({
  topic: z.string().describe('The topic or title of the blog post to generate.'),
});
export type GeneratePostInput = z.infer<typeof GeneratePostInputSchema>;

const GeneratePostOutputSchema = z.object({
  excerpt: z.string().describe('A short, engaging summary of the blog post, between 20 and 50 words.'),
  content: z.string().describe('The full content of the blog post, written in Markdown format. It should have several paragraphs and use headings (##) to structure the content.'),
});
export type GeneratePostOutput = z.infer<typeof GeneratePostOutputSchema>;

const GenerateImageOutputSchema = z.object({
    imageUrl: z.string().describe("A URL for a generated image that is visually appealing and relevant to the blog post topic. The image should be in a 16:9 aspect ratio.")
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;


const generatePostPrompt = ai.definePrompt({
    name: 'generatePostPrompt',
    input: { schema: GeneratePostInputSchema },
    output: { schema: GeneratePostOutputSchema },
    prompt: `
        You are a helpful content writer for a Nigerian telecommunications service company called DataConnect.
        Your task is to generate a blog post based on the provided topic.

        The blog post should be informative, engaging, and relevant to a Nigerian audience.
        The tone should be friendly, professional, and helpful.

        Generate the following based on the topic: '{{{topic}}}'

        1.  **Excerpt**: A short summary of the blog post, around 20-50 words.
        2.  **Content**: The full blog post content. It should be well-structured with Markdown headings (e.g., '## Section Title'), paragraphs, and lists where appropriate. Aim for at least 3-4 paragraphs.
    `,
});

const generateImagePrompt = ai.definePrompt({
    name: 'generateImagePrompt',
    input: { schema: GeneratePostInputSchema },
    prompt: `
        Generate a visually stunning and professional image for a blog post with the topic: '{{{topic}}}'.

        The image should be:
        - Relevant to the topic.
        - High quality and suitable for a professional blog.
        - In a 16:9 aspect ratio.
        - Photorealistic or a high-quality digital illustration.
    `
});

const generatePostFlow = ai.defineFlow(
  {
    name: 'generatePostFlow',
    inputSchema: GeneratePostInputSchema,
    outputSchema: GeneratePostOutputSchema,
  },
  async (input) => {
    const { output } = await generatePostPrompt(input);
    if (!output) {
      throw new Error('Failed to generate post content');
    }
    return output;
  }
);

const generateImageFlow = ai.defineFlow(
    {
      name: 'generateImageFlow',
      inputSchema: GeneratePostInputSchema,
      outputSchema: GenerateImageOutputSchema,
    },
    async (input) => {
      const { media } = await ai.generate({
        model: 'googleai/imagen-4.0-fast-generate-001',
        prompt: input.topic,
        config: {
            aspectRatio: '16:9',
        }
      });
      if (!media.url) {
        throw new Error('Failed to generate image');
      }
      return { imageUrl: media.url };
    }
  );

export async function generatePostContent(input: GeneratePostInput): Promise<GeneratePostOutput> {
    return generatePostFlow(input);
}

export async function generatePostImage(input: GeneratePostInput): Promise<GenerateImageOutput> {
    return generateImageFlow(input);
}
