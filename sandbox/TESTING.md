# DotPassport Sandbox - Testing Checklist

## Phase 8: Testing & Launch Prep

This document contains a comprehensive testing checklist to ensure the DotPassport Sandbox platform is production-ready.

---

## 🧪 Functional Testing

### Dashboard Page
- [ ] All 4 stat cards display correctly
- [ ] Request Analytics Chart renders with all time ranges (1H, 6H, 24H, 7D, 30D)
- [ ] Endpoint Breakdown Table shows data and is sortable
- [ ] Status Code Pie Chart displays correctly
- [ ] Response Time Histogram renders with proper buckets
- [ ] Recent Activity Feed shows last 10 requests
- [ ] Auto-refresh works (every 10 seconds)
- [ ] Rate limit progress bars show correct percentages
- [ ] Rate limit colors change based on usage (green < 75%, yellow 75-90%, red > 90%)
- [ ] Quick actions navigate to correct pages
- [ ] Sparklines on stat cards show 24h trends
- [ ] Number counters animate on page load
- [ ] Click on chart elements filters request logs

### API Testing Page
- [ ] Method list displays all 7 SDK methods
- [ ] Method grouping by category works
- [ ] Search bar filters methods correctly
- [ ] Recently used section appears when methods are tested
- [ ] Method Documentation card shows full details
- [ ] TypeScript interface displays correctly in SchemaViewer
- [ ] Parameter form validates inputs
- [ ] Required/optional indicators show correctly
- [ ] Test button executes requests
- [ ] Response displays in JSON tree view
- [ ] Response syntax highlighting works
- [ ] Copy response button works
- [ ] Download JSON button works
- [ ] Request History tab shows last 20 requests
- [ ] Click history entry loads parameters
- [ ] Code Examples tab shows all 4 languages (TypeScript, JavaScript, cURL, Python)
- [ ] Copy code examples button works
- [ ] Code examples use actual parameter values
- [ ] Preset manager saves/loads parameter combinations

### Widget Testing Page
- [ ] Widget preview renders correctly
- [ ] Configuration changes update preview in real-time
- [ ] Theme presets (Light, Dark, Purple, Pink, Custom) work
- [ ] Live theme editor updates widget
- [ ] Color pickers work correctly
- [ ] Font size slider updates widget
- [ ] Border radius slider works
- [ ] Shadow intensity changes apply
- [ ] Save custom theme to localStorage works
- [ ] Device preview modes (Desktop, Tablet, Mobile) work
- [ ] Device width changes correctly
- [ ] Background color picker updates preview
- [ ] Screenshot button captures widget
- [ ] Embed code tab shows correct code
- [ ] Integration Guide tab displays all 5 sections
- [ ] Tab navigation works in Integration Guide
- [ ] Syntax highlighting in Integration Guide works
- [ ] Copy code buttons work in Integration Guide

### Request Logs Page
- [ ] Table displays all request logs
- [ ] Filters work correctly (Endpoint, Method, Status, Date Range)
- [ ] Search bar filters logs
- [ ] Active filter chips display
- [ ] Click X on filter chip removes filter
- [ ] Date range picker works with presets
- [ ] Custom date range selection works
- [ ] Export button opens modal
- [ ] Refresh button updates data
- [ ] Auto-refresh toggle works (10s, 30s, off)
- [ ] Click row opens detail modal
- [ ] Expandable rows show request headers
- [ ] Status badges color-coded correctly (2xx=green, 4xx=yellow, 5xx=red)
- [ ] Response time color-coded correctly (<100ms=green, 100-500ms=yellow, >500ms=red)
- [ ] User-agent icon detection works
- [ ] Hover actions (View details, Copy cURL) appear
- [ ] Loading skeleton displays while fetching
- [ ] Pagination works correctly
- [ ] Sort by columns works

### Request Detail Modal
- [ ] Modal opens with smooth animation
- [ ] Overview tab shows request/response summary
- [ ] Timeline visualization displays correctly
- [ ] Copy cURL button generates correct command
- [ ] Request Details tab shows all information
- [ ] Query parameters table displays
- [ ] Headers are collapsible
- [ ] Body shows formatted JSON
- [ ] IP address and geolocation display (if available)
- [ ] User-agent string shows
- [ ] Response Details tab shows status and headers
- [ ] Response body in JSON tree viewer works
- [ ] Error stack trace displays for errors (4xx, 5xx)
- [ ] Performance tab shows breakdown
- [ ] Performance grade displays (A-F)
- [ ] Comparison to average shows
- [ ] Modal closes on Escape key
- [ ] Modal closes on backdrop click
- [ ] Close button works
- [ ] Tab keyboard navigation works (Arrow keys)

### Export Logs Modal
- [ ] Modal opens from Export button
- [ ] Format selection (CSV/JSON) works
- [ ] Date range uses current filters
- [ ] Custom date range can be set
- [ ] Fields checkboxes select/deselect
- [ ] Preview shows first 5 rows
- [ ] Export button downloads file
- [ ] Downloaded file has correct format
- [ ] Downloaded file contains selected fields
- [ ] Limit to 1000 rows enforced
- [ ] Modal closes after export

### Settings Page
- [ ] Appearance section displays
- [ ] Theme selector (Light/Dark/System) works
- [ ] Theme changes apply immediately
- [ ] Sidebar preference (Expanded/Collapsed) works
- [ ] Compact mode toggle works
- [ ] Reduced motion toggle works
- [ ] Account Information displays correctly
- [ ] API Key displays (masked, first 8 chars)
- [ ] Copy API Key button works
- [ ] Regenerate API Key requires wallet signature
- [ ] Regenerate API Key updates key
- [ ] Warning shown before regeneration
- [ ] Rate Limits section displays all three (Hourly, Daily, Monthly)
- [ ] Progress bars show correct usage
- [ ] Usage forecast displays
- [ ] Alert preferences (75%, 90%, 100%) work
- [ ] Security & Audit section shows recent events
- [ ] Login history displays last 10 logins
- [ ] CORS allowed origins editable (if implemented)
- [ ] Developer Tools section displays
- [ ] Webhook configuration (if implemented)
- [ ] Postman collection export button works
- [ ] SDK version info displays

---

## 📱 Responsive Testing

### Mobile (375px - iPhone SE)
- [ ] Sidebar becomes drawer
- [ ] Hamburger menu opens/closes sidebar
- [ ] Backdrop overlay appears when sidebar open
- [ ] All pages render correctly
- [ ] Tables convert to cards
- [ ] Charts render (simplified if needed)
- [ ] Touch targets are large enough (44px minimum)
- [ ] Forms are usable
- [ ] Modals fit screen
- [ ] Navigation works
- [ ] Text is readable (not too small)
- [ ] No horizontal scrolling
- [ ] Bottom navigation accessible

### Tablet (768px - iPad)
- [ ] Sidebar visible and fixed
- [ ] Layout adapts to tablet width
- [ ] Charts render at appropriate size
- [ ] Tables display correctly
- [ ] Touch interactions work
- [ ] Modals sized appropriately
- [ ] Navigation usable
- [ ] All features accessible

### Desktop (1200px+)
- [ ] Full layout displays
- [ ] Sidebar fixed and collapsible
- [ ] Main content area sized correctly
- [ ] Charts use full available space
- [ ] Tables show all columns
- [ ] Modals centered and sized well
- [ ] Multi-column layouts work
- [ ] No wasted space

---

## 🎨 Dark Mode Testing

### All Pages
- [ ] Dark mode toggle in navbar works
- [ ] Theme persists in localStorage
- [ ] System theme detection works (when set to 'System')
- [ ] All text readable in dark mode
- [ ] All backgrounds use dark colors
- [ ] All borders visible
- [ ] All inputs styled correctly
- [ ] All buttons styled correctly
- [ ] All cards have proper dark backgrounds
- [ ] All modals have dark backgrounds
- [ ] All dropdowns styled correctly
- [ ] All tooltips readable
- [ ] All charts use dark mode colors
- [ ] All syntax highlighting uses dark theme
- [ ] No light mode artifacts
- [ ] Smooth transition between themes

### Color Contrast
- [ ] Text-to-background contrast meets WCAG AA (4.5:1)
- [ ] Interactive elements have sufficient contrast
- [ ] Focus indicators visible in both modes
- [ ] Error messages readable
- [ ] Success messages readable
- [ ] Warning messages readable
- [ ] Disabled states clearly indicated

---

## ⌨️ Keyboard Navigation

### General
- [ ] All interactive elements tabbable
- [ ] Tab order logical
- [ ] Focus indicators visible (2px purple outline)
- [ ] Skip to main content link works
- [ ] No keyboard traps

### Modals
- [ ] Focus trapped within modal
- [ ] Tab cycles through modal elements
- [ ] Shift+Tab cycles backward
- [ ] Escape closes modal
- [ ] Focus returns to trigger element after close

### Dropdowns & Selects
- [ ] Arrow keys navigate options
- [ ] Enter selects option
- [ ] Escape closes dropdown
- [ ] Space opens/closes (when appropriate)
- [ ] Type-ahead works (if implemented)

### Tabs
- [ ] Arrow keys navigate between tabs
- [ ] Enter/Space activates tab
- [ ] Tab moves to tab content
- [ ] Active tab indicated visually

### Buttons & Links
- [ ] Enter activates
- [ ] Space activates (for buttons)
- [ ] Disabled state prevents activation

---

## ♿ Accessibility Testing

### Screen Reader Support
- [ ] Page title announced on route change
- [ ] Headings have proper hierarchy (h1, h2, h3)
- [ ] Landmarks used (`<nav>`, `<main>`, `<article>`, `<aside>`)
- [ ] ARIA labels on icon-only buttons
- [ ] ARIA live regions for dynamic content
- [ ] Form labels associated with inputs
- [ ] Error messages announced
- [ ] Success messages announced
- [ ] Loading states announced
- [ ] Modal role and aria-modal set
- [ ] Dialog title and description linked
- [ ] Tab role and aria-selected set
- [ ] Button roles explicit
- [ ] Link text descriptive
- [ ] Images have alt text
- [ ] Icons have aria-hidden (when decorative)

### Color & Contrast
- [ ] All text meets WCAG AA contrast (4.5:1)
- [ ] Large text meets WCAG AA contrast (3:1)
- [ ] Focus indicators visible (3:1 contrast)
- [ ] Error states not indicated by color alone
- [ ] Success states not indicated by color alone
- [ ] Chart data distinguishable without color

### Reduced Motion
- [ ] Animations respect prefers-reduced-motion
- [ ] Essential motion still works (progress indicators)
- [ ] Page transitions work without motion
- [ ] Hover effects still provide feedback

---

## 🚀 Performance Testing

### Load Times
- [ ] Initial page load < 2 seconds
- [ ] Page transitions < 500ms
- [ ] API calls < 200ms
- [ ] Chart rendering < 1 second
- [ ] Modal opening < 300ms
- [ ] Search results < 500ms

### Bundle Size
- [ ] Main bundle < 200KB (gzipped)
- [ ] Vendor bundle < 400KB (gzipped)
- [ ] Total initial < 600KB (gzipped)
- [ ] Each lazy-loaded route < 150KB

### Lighthouse Scores (Target)
- [ ] Performance: 90+
- [ ] Accessibility: 95+
- [ ] Best Practices: 95+
- [ ] SEO: 100

### Core Web Vitals
- [ ] LCP (Largest Contentful Paint) < 2.5s
- [ ] FID (First Input Delay) < 100ms
- [ ] CLS (Cumulative Layout Shift) < 0.1
- [ ] INP (Interaction to Next Paint) < 200ms

### Memory & CPU
- [ ] No memory leaks on navigation
- [ ] Event listeners cleaned up
- [ ] Intervals/timeouts cleared
- [ ] Smooth animations (60fps)
- [ ] No excessive re-renders
- [ ] Virtualization for long lists (if implemented)

---

## 🌐 Cross-Browser Testing

### Chrome (Latest)
- [ ] All features work
- [ ] Layout correct
- [ ] Animations smooth
- [ ] No console errors

### Firefox (Latest)
- [ ] All features work
- [ ] Layout correct
- [ ] Animations smooth
- [ ] No console errors

### Safari (Latest)
- [ ] All features work
- [ ] Layout correct
- [ ] Animations smooth
- [ ] No console errors
- [ ] Date picker works (native or custom)

### Edge (Latest)
- [ ] All features work
- [ ] Layout correct
- [ ] Animations smooth
- [ ] No console errors

---

## 🔐 Security Testing

### API Keys
- [ ] API key never exposed in URLs
- [ ] API key never logged to console
- [ ] API key masked in UI (first 8 chars only)
- [ ] Regeneration requires wallet signature
- [ ] API key stored securely in localStorage
- [ ] No XSS vulnerabilities in key handling

### Input Validation
- [ ] All form inputs validated
- [ ] No SQL injection possible (if backend connected)
- [ ] No XSS possible (all user input sanitized)
- [ ] File uploads validated (if implemented)
- [ ] Max lengths enforced
- [ ] Type validation enforced

### Request Security
- [ ] CORS headers set correctly (backend)
- [ ] Rate limiting enforced (backend)
- [ ] Authentication required where needed
- [ ] No sensitive data in error messages
- [ ] HTTPS enforced (production)

---

## 🧩 Component Testing

### UI Component Library
- [ ] **Button**: All variants render correctly
- [ ] **Button**: All sizes work
- [ ] **Button**: Loading state displays spinner
- [ ] **Button**: Icon positioning (left/right) works
- [ ] **Button**: Disabled state works
- [ ] **Card**: All variants render
- [ ] **Card**: Sub-components (Header/Body/Footer) work
- [ ] **Card**: Padding levels work
- [ ] **Badge**: All color variants correct
- [ ] **Badge**: All sizes work
- [ ] **Badge**: Dot indicator displays
- [ ] **EmptyState**: Icon, title, description display
- [ ] **EmptyState**: Action button works
- [ ] **CopyButton**: Copies text to clipboard
- [ ] **CopyButton**: Success feedback shows
- [ ] **CopyButton**: Returns to normal after duration
- [ ] **Skeleton**: All variants render
- [ ] **Skeleton**: Custom dimensions work
- [ ] **Skeleton**: Multiple count works
- [ ] **Modal**: Opens and closes smoothly
- [ ] **Modal**: All sizes work
- [ ] **Modal**: Focus trap works
- [ ] **Modal**: Escape closes modal
- [ ] **Modal**: Backdrop click closes (if enabled)
- [ ] **Modal**: Body scroll locked when open
- [ ] **Tabs**: All variants render
- [ ] **Tabs**: Tab switching works
- [ ] **Tabs**: Keyboard navigation works
- [ ] **Tabs**: URL sync works (if enabled)
- [ ] **Tabs**: Lazy loading works (if enabled)
- [ ] **Tooltip**: All positions work (top/bottom/left/right)
- [ ] **Tooltip**: Delay options work
- [ ] **Tooltip**: Shows on hover
- [ ] **Tooltip**: Shows on focus
- [ ] **Tooltip**: Arrow displays
- [ ] **Select**: Opens/closes correctly
- [ ] **Select**: Search filters options
- [ ] **Select**: Multi-select works
- [ ] **Select**: Keyboard navigation works
- [ ] **Select**: Clearable works
- [ ] **Select**: Disabled state works
- [ ] **Select**: Custom rendering works
- [ ] **DatePicker**: Calendar displays
- [ ] **DatePicker**: Date selection works
- [ ] **DatePicker**: Presets work
- [ ] **DatePicker**: Min/max constraints enforced
- [ ] **DatePicker**: Clearable works
- [ ] **DatePicker**: Month navigation works

---

## 📊 Data & API Testing

### API Integration
- [ ] All 7 SDK methods callable
- [ ] Request parameters validated
- [ ] Responses displayed correctly
- [ ] Error responses handled gracefully
- [ ] Loading states shown during requests
- [ ] Request logs captured
- [ ] Stats updated after requests
- [ ] Rate limits updated after requests

### Data Display
- [ ] Empty states show when no data
- [ ] Loading states show while fetching
- [ ] Error states show on failure
- [ ] Retry buttons work
- [ ] Data refreshes correctly
- [ ] Cached data used when appropriate
- [ ] Real-time updates work (if implemented)

### Edge Cases
- [ ] Very long text truncates properly
- [ ] Very large numbers format correctly
- [ ] Empty arrays handled
- [ ] Null values handled
- [ ] Undefined values handled
- [ ] Malformed data doesn't crash app
- [ ] Network errors handled
- [ ] Timeout errors handled

---

## 🐛 Error Handling

### User Errors
- [ ] Invalid form inputs show error messages
- [ ] Required fields validated
- [ ] Error messages clear and helpful
- [ ] Error states visually distinct
- [ ] Errors clearable (can correct and retry)

### System Errors
- [ ] Network errors caught and displayed
- [ ] API errors show user-friendly messages
- [ ] 404 errors handled
- [ ] 500 errors handled
- [ ] Rate limit errors handled
- [ ] Timeout errors handled
- [ ] Error boundary catches React errors
- [ ] Error boundaries show fallback UI
- [ ] Errors logged (if logging implemented)

### Recovery
- [ ] Retry buttons work
- [ ] Page refresh clears errors
- [ ] Navigation clears errors
- [ ] Users can continue after errors

---

## 💾 Data Persistence

### localStorage
- [ ] Theme preference persists
- [ ] Sidebar state persists (expanded/collapsed)
- [ ] Request history persists
- [ ] Custom themes persist
- [ ] API key persists (if stored)
- [ ] Recent methods persist
- [ ] Presets persist

### Session State
- [ ] Form values preserved during session
- [ ] Scroll position preserved on back navigation
- [ ] Filter state preserved
- [ ] Tab state preserved

---

## 🎭 Animation & Interaction Testing

### Animations
- [ ] Page transitions smooth
- [ ] Modal animations smooth (fade + slide)
- [ ] Dropdown animations smooth
- [ ] Chart entry animations work
- [ ] Number counters animate
- [ ] Progress bars animate
- [ ] Loading spinners animate
- [ ] Success checkmarks animate
- [ ] No animation jank (maintain 60fps)

### Micro-interactions
- [ ] Hover effects work (scale, shadow)
- [ ] Click feedback works (scale down)
- [ ] Button ripple effects (if implemented)
- [ ] Smooth focus transitions
- [ ] Tab indicator animates
- [ ] Collapse/expand animations smooth

---

## 📝 Content & Copy Testing

### Text Content
- [ ] No spelling errors
- [ ] No grammar errors
- [ ] Consistent terminology
- [ ] Clear, concise copy
- [ ] Helpful error messages
- [ ] Informative empty states
- [ ] Accurate documentation

### Code Examples
- [ ] All code examples syntactically correct
- [ ] Code examples run without errors
- [ ] Code examples use actual user values
- [ ] Syntax highlighting correct
- [ ] Comments helpful

---

## 🔄 State Management Testing

### Component State
- [ ] Form state updates correctly
- [ ] Toggle states work
- [ ] Selection state preserved
- [ ] Loading states accurate
- [ ] Error states clear correctly

### Global State
- [ ] Theme state shared across app
- [ ] Auth state (if implemented) consistent
- [ ] API key accessible where needed
- [ ] User data consistent

---

## 🧪 Integration Testing

### User Flows
- [ ] **Flow 1**: Dashboard → API Testing → Test method → View logs
- [ ] **Flow 2**: Settings → Regenerate API key → Test API → Success
- [ ] **Flow 3**: Widget Testing → Configure → Preview → Copy code → Integrate
- [ ] **Flow 4**: Request Logs → Filter → View details → Export
- [ ] **Flow 5**: Dashboard → Click chart → Filtered logs
- [ ] **Flow 6**: API Testing → View schema → Copy interface → Use in code
- [ ] **Flow 7**: Settings → Change theme → All pages update
- [ ] **Flow 8**: API Testing → Test → View history → Rerun previous test

---

## ✅ Pre-Launch Checklist

### Code Quality
- [ ] No console.log statements (except intentional)
- [ ] No commented-out code
- [ ] No TODO comments
- [ ] No unused imports
- [ ] No unused variables
- [ ] TypeScript strict mode enabled
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Code formatted consistently

### Documentation
- [ ] README.md updated
- [ ] FEATURES.md complete
- [ ] Code comments where needed
- [ ] Component prop types documented
- [ ] API schemas documented
- [ ] Setup instructions clear
- [ ] Environment variables documented

### Build & Deploy
- [ ] Production build succeeds
- [ ] No build warnings
- [ ] Bundle size acceptable
- [ ] Source maps generated (for debugging)
- [ ] Environment variables set
- [ ] HTTPS configured (production)
- [ ] Domain configured (production)

### Monitoring (if implemented)
- [ ] Error tracking configured
- [ ] Analytics configured
- [ ] Performance monitoring configured
- [ ] Logging configured

---

## 📋 Testing Tools

### Recommended Tools
- **Manual Testing**: All browsers, devices
- **Lighthouse**: Performance, accessibility, best practices
- **axe DevTools**: Accessibility testing
- **React DevTools**: Component inspection, profiling
- **Redux DevTools**: State inspection (if using Redux)
- **Chrome DevTools**: Network, performance, console
- **Screen Readers**: NVDA (Windows), VoiceOver (Mac), JAWS
- **Keyboard Only**: Test with mouse disconnected
- **Color Contrast Checker**: WebAIM, Chrome DevTools
- **Mobile Emulators**: Chrome DevTools, real devices

---

## 🎯 Success Criteria

### Minimum Requirements
- ✅ All functional tests pass
- ✅ Mobile, tablet, desktop responsive
- ✅ Dark mode works everywhere
- ✅ Keyboard navigation works
- ✅ Screen reader compatible
- ✅ WCAG AA compliant
- ✅ Performance score > 90
- ✅ No critical bugs
- ✅ All browsers supported
- ✅ Documentation complete

### Nice to Have
- ⭐ Lighthouse score > 95 all categories
- ⭐ Bundle size < 500KB total
- ⭐ LCP < 2s
- ⭐ Zero console errors/warnings
- ⭐ Reduced motion support
- ⭐ Touch gesture support
- ⭐ Offline support (if implemented)

---

## 📝 Notes

- Test on real devices when possible, not just emulators
- Test with slow network (throttling)
- Test with CPU throttling
- Test with screen readers
- Test with keyboard only
- Test with color blindness simulators
- Test edge cases and error conditions
- Document any issues found
- Retest after fixes

---

## 🎓 Testing Best Practices

1. **Test early and often** - Don't wait until the end
2. **Test on real devices** - Emulators miss real-world issues
3. **Test with real users** - Get feedback early
4. **Test accessibility** - Use screen readers, keyboard only
5. **Test performance** - On slow devices and networks
6. **Test edge cases** - Empty states, errors, limits
7. **Document findings** - Track issues and resolutions
8. **Retest after changes** - Ensure fixes don't break other things

---

**Last Updated**: 2026-01-02
**Version**: 1.0
