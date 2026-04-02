# Radix UI MCP Server — Specification

> This spec defines a Model Context Protocol server for Radix UI primitives.
> It does not yet exist. This document is the authoritative specification for building it.

You are a senior design systems engineer tasked with specifying a Radix UI MCP (Model Context Protocol) server that does not yet exist. Radix UI is a headless, unstyled React primitive library focused on accessibility and composability. The goal of this MCP is to give an AI coding assistant deep, structured knowledge of Radix primitives so it can generate components that are dependency-linked (not copy-owned), correctly composed, and accessible by default.

Structure your response across these dimensions:

## 1. Resource Catalog

What static knowledge should the MCP expose as resources? Consider: the full primitive catalog (@radix-ui/react-* packages), the composition contract per primitive (which sub-components exist, e.g. Dialog.Root → Dialog.Trigger + Dialog.Portal + Dialog.Overlay + Dialog.Content), the prop API per sub-component, which primitives are composable with each other, and WAI-ARIA roles and keyboard interaction contracts per primitive.

## 2. Tool Surface

What actions should the MCP expose as callable tools? Consider: querying a primitive's full composition tree, generating a bare unstyled component scaffold for a given primitive, checking whether a generated component correctly satisfies the primitive's accessibility contract, resolving which @radix-ui/react-* package to install for a given component need, and querying the latest published version of a primitive.

## 3. Composition Pattern Library

Radix primitives are intentionally low-level. The MCP should expose curated composition patterns: how to wire asChild correctly, how to forward refs through composed components, how to handle controlled vs uncontrolled state at the primitive level, and how to layer CVA or class-variance-authority on top of a headless primitive without breaking its accessibility tree.

## 4. Styling Contract Awareness

Radix is styling-agnostic. The MCP should have opinions about: what data attributes Radix exposes per primitive (e.g. data-state, data-disabled, data-orientation) and how to target them, how to structure CSS custom property hooks for a token-driven design system, and how to use Tailwind or CSS Modules against Radix data attributes without specificity conflicts.

## 5. Design System Authoring Hooks

This MCP targets design system authors, not consumer app developers. Consider: Storybook story generation that reflects the primitive's composition slots as controls, component API design guidance (when to expose the underlying Radix prop vs wrap it), token aliasing patterns (semantic CSS custom properties mapped to Radix data attribute states), and variant schema generation using CVA that stays coherent with the primitive's state model.

## 6. Versioning and Dependency Awareness

Unlike shadcn's copy-own model, Radix components remain in node_modules. The MCP should surface: peer dependency requirements per primitive, known breaking changes between major versions, and which primitives share internal Radix packages (e.g. @radix-ui/react-primitive, @radix-ui/react-compose-refs) so the model understands the true dependency graph.

## 7. What It Should NOT Do

Define the boundary clearly. What belongs in this MCP vs in a shadcn MCP vs in a design system-specific MCP vs in the LLM's base training knowledge? The Radix MCP should be primitive-layer only — it should not have opinions about tokens, brand, or component naming conventions.

Be specific about data shapes, not just feature names. Where a tool is proposed, define its input/output contract. Where a resource is proposed, define its schema. Assume the consumer of this MCP is an AI assistant generating production-grade design system components, not scaffolding a consumer app.
