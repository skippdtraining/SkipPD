/**
 * @fileoverview Scroll helpers that account for the sticky header.
 *
 * Why measure at runtime: the header height differs between desktop and
 * phone, and changes when the compact search or phone menu is shown.
 * Reading its real height each time means nothing breaks if the header
 * design changes later.
 */

/**
 * Smoothly scrolls so `element`'s top edge sits just below the sticky
 * header (or at the very top if there is no header).
 */
export function scrollBelowHeader(element: HTMLElement): void {
  const header = document.querySelector('header');
  const headerHeight = header ? header.getBoundingClientRect().height : 0;
  const top = element.getBoundingClientRect().top + window.scrollY - headerHeight;
  window.scrollTo({top, behavior: 'smooth'});
}
