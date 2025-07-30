# Invo UI Design Guidelines

## Overview

This document outlines the design principles, component styles, and visual language for the Invo application. These guidelines have been established through iterative UI improvements and should be followed to maintain consistency across the application.

## Design Principles

1. **Visual Hierarchy** - Use size, color, and spacing to guide users' attention to the most important elements first.
2. **Depth & Dimension** - Employ subtle shadows, borders, and background effects to create a sense of depth and layering.
3. **Responsive Design** - Ensure all components adapt gracefully to different screen sizes.
4. **Consistent Styling** - Maintain consistent styling patterns across similar components.
5. **Microinteractions** - Use hover effects, transitions, and subtle animations to enhance user experience.

## Color Palette

- **Primary Colors**: Teal/green shades for CTAs and primary actions
- **Secondary Colors**: Dark grays for text, light grays for backgrounds
- **Accent Colors**: Used sparingly for highlighting important elements
- **Background Colors**: Subtle gradients and light backgrounds with occasional blur effects

## Typography

- **Headings**: Bold, clear, with appropriate spacing
- **Body Text**: Readable size with sufficient line height
- **CTAs and Buttons**: Bold, clear text with proper padding
- **Tags and Labels**: Compact but legible, with distinctive styling

## Component Guidelines

### Cards

#### Standard Cards (Pricing, Blog, Testimonials)
- **Border**: Subtle, light border (1px) with slight rounding (border-radius: 8-12px)
- **Shadow**: `shadow-md` with hover effect increasing to `shadow-lg`
- **Background**: Light with subtle gradient or blur effect
- **Padding**: Consistent internal padding (16-24px)
- **Hover Effect**: Slight scale transform (1.01-1.03) with shadow enhancement
- **Transitions**: Smooth transitions (0.2-0.3s) for all hover effects

#### Featured Cards
- Additional border highlight or background color
- Slightly more pronounced shadow
- Optional decorative elements (tags, ribbons)

### Sticky Section Navigation

#### Overview
A fixed-position tab navigation component that updates as the user scrolls through different sections of a form or content page. This component enhances user experience by providing context about the current position and allowing quick navigation between sections.

#### Visual Style
- **Position**: Sticky at the top of the viewport
- **Background**: White with subtle border and shadow for depth
- **Tabs**: Horizontally scrollable on mobile (with hidden scrollbar)
- **Active State**: Primary color background with contrasting text
- **Inactive State**: Muted text that brightens on hover
- **Transitions**: Smooth color transitions (0.2s)

#### Behavior
- **Scrolling**: Automatically updates active tab based on scroll position
- **Navigation**: Clicking a tab smooth-scrolls to the corresponding section
- **Responsiveness**: Horizontally scrollable on smaller screens with hidden scrollbar
- **Accessibility**: Maintains focus states and keyboard navigation

### Buttons

#### Primary Buttons
- **Background**: Solid color with gradient or subtle pattern
- **Border**: Thin border matching or complementing background
- **Border Radius**: Consistent with other elements (8px)
- **Padding**: Horizontal (16-24px), Vertical (8-12px)
- **Shadow**: `shadow-md` with hover increasing to `shadow-lg`
- **Hover Effect**: Slight color shift, shadow enhancement
- **Transitions**: 0.2-0.3s for all properties

#### Secondary Buttons
- Lighter background or outline style
- Same border radius and padding as primary
- More subtle hover effects

### Tags and Labels

- **Border**: Thin (1px) with matching or complementing color
- **Border Radius**: 4-6px (smaller than cards/buttons)
- **Background**: Light or semi-transparent
- **Padding**: Compact (4-8px horizontal, 2-4px vertical)
- **Shadow**: Subtle or none
- **Typography**: Slightly smaller than body text, often uppercase or medium weight

### Section Headers

- Clear visual separation from content (margin, border, or background)
- Consistent alignment with content below
- Optional decorative elements (underlines, accent colors)
- Special tags ("MOST POPULAR", "LATEST UPDATES") with distinctive styling

### Lists and Features

- Consistent spacing between items
- Clear visual indicators (icons, bullets, or numbers)
- Hover effects for interactive lists
- Background highlighting for important items

### Footer

- **Background**: Darker than main content with subtle overlay
- **Padding**: More horizontal padding than vertical
- **Spacing**: Compact but readable grouping of links
- **Borders**: Subtle separators between sections
- **Typography**: Slightly smaller than main content
- **Hover Effects**: Subtle translation or color change for links

## Microinteractions

### Hover Effects

- **Cards**: Slight scale (1.01-1.03) + enhanced shadow
- **Buttons**: Background/border color shift + enhanced shadow
- **Links**: Color change + subtle movement (1-2px translation)
- **Icons**: Color change or slight movement

### Transitions

- Use consistent timing (0.2-0.3s)
- Apply to all interactive elements
- Ensure smooth property changes (transform, opacity, color)

## Decorative Elements

### Shadows

- **Light**: `shadow-sm` for subtle depth
- **Medium**: `shadow-md` for standard components
- **Heavy**: `shadow-lg` for elevated or focused elements
- **Hover**: Increase shadow depth on hover

### Borders

- **Standard**: 1px solid with low opacity color
- **Highlight**: 1-2px with higher opacity or accent color
- **Separators**: Very subtle (0.5-1px) with low opacity

### Blur Effects

- Apply to backgrounds or decorative elements
- Keep subtle (backdrop-filter: blur(4-12px))
- Combine with low opacity backgrounds

## Responsive Behavior

- Maintain consistent styling across breakpoints
- Adjust padding and margins proportionally
- Stack elements vertically on smaller screens
- Ensure touch targets remain sufficiently large on mobile

## Accessibility Considerations

- Maintain sufficient color contrast (WCAG AA minimum)
- Ensure hover/focus states are clearly visible
- Don't rely solely on color to convey information
- Maintain readable text sizes (minimum 16px for body text)

---

These guidelines should be followed for all new components and UI updates to maintain a consistent, professional, and engaging user experience across the Invo application.