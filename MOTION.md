# Davuud Ghani, motion system

Concept: typesetting. Nothing fades in; it is set, ruled, inked, stamped.

## Tokens
Easing A `cubic-bezier(0.22,1,0.36,1)` for entrances and reveals.
Easing B `cubic-bezier(0.65,0,0.35,1)` for swaps and exits.
Durations: 250ms micro / 450ms hover / 650ms structural / 1000ms narrative.
Stagger units: 38ms (words), 45ms (letters), 55ms (sweep), 160ms (paragraphs).
Max travel 16px, except ink (fills, rules, veils).

## Inventory
Loading: paper veil, name plus progress rule; rides font load; min 650ms, hard cap 1.4s; lifts as a sheet.
Entrance: letters rise with 45ms stagger, italic sweep crosses the name once, rules draw, standfirst sets word by word.
Scroll: reading-progress rule; sticky micro masthead (inverts over the dark band); jumbo 8 ink-fills with scroll; counters set their figures; paragraph wipes; hairlines draw; dark band stamps in with a clip; ghost watermark drifts at 0.05x.
Cursor (fine pointers): lerped dot, exclusion blend; announces intent: plus to expand, multiply to close, arrow to leave, dot on plain links.
Hover: label swaps to italic blue duplicate on every link; rows slide, rule in blue, ghost figure; plus pre-rotates; button ink-sweep plus magnetic pull.
Exit: ink sheet rises with the destination named, 420ms, then navigates. Modifier clicks bypass.

## Discipline
prefers-reduced-motion disables everything, content instant.
Touch: no cursor or hover dependencies; taps drive rows; scroll drives the rest; sweep plays once on load.
Transform and opacity only; IntersectionObserver plus one passive rAF scroll handler.
Note: elements hidden by clip-path are invisible to IntersectionObserver; trigger from an unclipped parent or the scroll handler.
