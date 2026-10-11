import type React from "react";
import type { MDXComponents } from "mdx/types";
import { Callout, Aside, KeyIdea, Contrast, Grid } from "@/components/mdx/Callout";
import {
  Figure,
  Legend,
  DataBadge,
  Formula,
  SourceNote,
  ShapeTracker,
  ShapeTable,
  ModuleHeader,
  GoingDeeper,
  KeyNumbers,
  Compare,
  Cols,
  Step,
  Pitfall,
  ProductionNote,
  Warning,
  Definition,
  Intuition,
} from "@/components/mdx/content";
import { Quiz } from "@/components/mdx/Quiz";
import { Experiments } from "@/components/mdx/Experiments";
import { BreakIt } from "@/components/mdx/BreakIt";
import { Lab } from "@/components/mdx/Lab";
import { DeviceLab } from "@/components/lab/DeviceLab";
import { Math as M } from "@/components/mdx/Math";
import { TokenizerPlayground } from "@/components/lab/TokenizerPlayground";
import { ChatTemplateBuilder } from "@/components/lab/ChatTemplateBuilder";
import { ModelRun } from "@/components/lab/ModelRun";
import { SkillTree } from "@/components/viz/SkillTree";
import { Diagnostic } from "@/components/viz/Diagnostic";
import { GlossaryBrowser, Flashcards } from "@/components/viz/Terms";
import { ForwardPassMiniMap } from "@/components/viz/ForwardPassMiniMap";
import { FragmentationExplorer } from "@/components/viz/FragmentationExplorer";
import { RadixTreeExplorer } from "@/components/viz/RadixTreeExplorer";
import { SpeculativeExplorer } from "@/components/viz/SpeculativeExplorer";

/**
 * Global MDX component map. Every lesson gets this set without importing
 * anything, which keeps the lesson files about the *teaching* rather than
 * about plumbing. Module-specific visuals are imported explicitly in the MDX.
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    ...components,
    Callout,
    Aside,
    KeyIdea,
    Contrast,
    Grid,
    Figure,
    Legend,
    DataBadge,
    Formula,
    SourceNote,
    ShapeTracker,
    ShapeTable,
    ModuleHeader,
    GoingDeeper,
    KeyNumbers,
    Compare,
    Cols,
    Step,
    Pitfall,
    ProductionNote,
    Warning,
    Definition,
    Intuition,
    Quiz,
    Experiments,
    BreakIt,
    Lab,
    // Labs you run on your own machine: steps, commands, questionnaire.
    DeviceLab,
    M,
    // Live, in-browser tools (tokenizer, chat template, real Qwen3 generation).
    TokenizerPlayground,
    ChatTemplateBuilder,
    ModelRun,
    // Shared interactive graphics that more than one lesson uses.
    SkillTree,
    Diagnostic,
    GlossaryBrowser,
    Flashcards,
    ForwardPassMiniMap,
    // Part 5 simulators: deterministic, steppable, and unit tested in /tests.
    FragmentationExplorer,
    RadixTreeExplorer,
    SpeculativeExplorer,
    // Headings get anchor ids from rehype-slug; add a hover affordance.
    h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h2 {...props} />,
    h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => <h3 {...props} />,
  };
}
