# React Modernization Guide

## Current State
- **React**: 15.x (released 2016)
- **Patterns**: Class components, `React.createClass`, manual PropTypes
- **Redux**: Classic connect() HOCs, verbose action/reducer patterns
- **Pain Points**: Lots of boilerplate, `this` binding, verbose state management

## Modern State (Target)
- **React**: 18.x (current stable)
- **Patterns**: Functional components with hooks
- **Redux**: Redux Toolkit + hooks (useSelector/useDispatch)
- **Benefits**: 40-50% less code, better performance, easier testing

---

## Phase 1: Foundation Upgrade (1-2 weeks)

### Step 1: Update Dependencies
```bash
# Backup first!
git checkout -b modernization

# Core React upgrade
npm install react@^18 react-dom@^18

# Redux stays but gets modern versions
npm install redux@^5 react-redux@^9

# Separate PropTypes (React 15.5+ deprecated in-package PropTypes)
npm install prop-types

# Redux Toolkit (optional but highly recommended)
npm install @reduxjs/toolkit
```

### Step 2: Update Babel Configuration
```javascript
// .babelrc or babel.config.js
{
  "presets": [
    ["@babel/preset-env", {
      "targets": { "browsers": ["last 2 versions"] }
    }],
    ["@babel/preset-react", {
      "runtime": "automatic" // New JSX transform (no need to import React)
    }]
  ]
}
```

### Step 3: Move PropTypes Imports
Search and replace across codebase:
```javascript
// OLD
import React, { PropTypes } from 'react';

// NEW
import React from 'react';
import PropTypes from 'prop-types';
```

### Step 4: Test Everything
React 15 → 18 should be mostly compatible, but test thoroughly:
- Server-side rendering
- All routes
- Redux connections
- Event handlers

---

## Phase 2: Gradual Component Migration

### Migration Priority (Easiest First)
1. **Leaf components** (no children, simple logic) - Challenge, Block
2. **Container components** (mostly Redux logic) - Nav, Panes
3. **Route components** (more complex lifecycle) - Show.jsx
4. **App root** (only after everything else works)

### Component Conversion Checklist

#### 1. Class → Functional Component
```javascript
// BEFORE
class MyComponent extends React.Component {
  render() {
    return <div>{this.props.name}</div>;
  }
}

// AFTER
function MyComponent({ name }) {
  return <div>{name}</div>;
}
```

#### 2. State Conversion
```javascript
// BEFORE
class Counter extends React.Component {
  constructor(props) {
    super(props);
    this.state = { count: 0 };
  }
  
  increment = () => {
    this.setState({ count: this.state.count + 1 });
  }
}

// AFTER
function Counter() {
  const [count, setCount] = useState(0);
  
  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);
}
```

#### 3. Redux Connection
```javascript
// BEFORE
function mapStateToProps(state) {
  return {
    user: userSelector(state),
    challenges: challengesSelector(state)
  };
}

function mapDispatchToProps(dispatch) {
  return {
    fetchUser: () => dispatch(fetchUser())
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(MyComponent);

// AFTER
function MyComponent() {
  const user = useSelector(userSelector);
  const challenges = useSelector(challengesSelector);
  const dispatch = useDispatch();
  
  const handleFetchUser = useCallback(() => {
    dispatch(fetchUser());
  }, [dispatch]);
}

export default MyComponent;
```

#### 4. Lifecycle Methods
```javascript
// BEFORE
class MyComponent extends React.Component {
  componentDidMount() {
    this.props.fetchData();
  }
  
  componentDidUpdate(prevProps) {
    if (prevProps.id !== this.props.id) {
      this.props.fetchData();
    }
  }
  
  componentWillUnmount() {
    this.props.cleanup();
  }
}

// AFTER
function MyComponent({ id, fetchData, cleanup }) {
  useEffect(() => {
    fetchData();
    
    return () => cleanup(); // Cleanup on unmount
  }, [id, fetchData, cleanup]); // Re-run when id changes
}
```

---

## Phase 3: Redux Toolkit Migration (Optional)

### Current Redux Pattern (Verbose)
```javascript
// types.js
export const FETCH_USER = 'FETCH_USER';
export const FETCH_USER_SUCCESS = 'FETCH_USER_SUCCESS';
export const FETCH_USER_ERROR = 'FETCH_USER_ERROR';

// actions.js
export function fetchUser() {
  return { type: FETCH_USER };
}

export function fetchUserSuccess(user) {
  return { type: FETCH_USER_SUCCESS, payload: user };
}

// reducer.js
export default function userReducer(state = {}, action) {
  switch(action.type) {
    case FETCH_USER_SUCCESS:
      return { ...state, ...action.payload };
    default:
      return state;
  }
}
```

### Redux Toolkit Pattern (Concise)
```javascript
// userSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchUser = createAsyncThunk('user/fetch', async () => {
  const response = await fetch('/api/user');
  return response.json();
});

const userSlice = createSlice({
  name: 'user',
  initialState: {},
  reducers: {
    updateUser: (state, action) => {
      Object.assign(state, action.payload); // Immer makes this safe
    }
  },
  extraReducers: (builder) => {
    builder.addCase(fetchUser.fulfilled, (state, action) => {
      Object.assign(state, action.payload);
    });
  }
});

export const { updateUser } = userSlice.actions;
export default userSlice.reducer;
```

**Benefits:**
- 70% less boilerplate
- Built-in async handling
- Immer integration (mutate state safely)
- TypeScript support

---

## Common Patterns Reference

### 1. Modal State Management
```javascript
// OLD CLASS
class Component extends React.Component {
  constructor(props) {
    super(props);
    this.state = { showModal: false };
  }
  openModal = () => this.setState({ showModal: true });
  closeModal = () => this.setState({ showModal: false });
}

// NEW HOOKS
function Component() {
  const [showModal, setShowModal] = useState(false);
  const openModal = useCallback(() => setShowModal(true), []);
  const closeModal = useCallback(() => setShowModal(false), []);
}
```

### 2. Computed Values
```javascript
// OLD CLASS (recalculates every render)
class Component extends React.Component {
  render() {
    const isLocked = !this.props.user || !this.props.user.hasCert;
    // ... rest of render
  }
}

// NEW HOOKS (memoized)
function Component({ user }) {
  const isLocked = useMemo(
    () => !user || !user.hasCert,
    [user]
  );
}
```

### 3. Event Handlers
```javascript
// OLD CLASS
class Component extends React.Component {
  handleClick = (e) => {
    e.preventDefault();
    this.props.onClick(this.props.id);
  }
}

// NEW HOOKS
function Component({ id, onClick }) {
  const handleClick = useCallback((e) => {
    e.preventDefault();
    onClick(id);
  }, [id, onClick]);
}
```

### 4. Conditional Rendering
```javascript
// Both work, but hooks version is cleaner with early returns
function Component({ isLocked, title }) {
  if (isLocked) {
    return <div>Locked: {title}</div>;
  }
  
  return <div>Open: {title}</div>;
}
```

---

## Testing Strategy

### 1. Before Starting
- [ ] Full test suite passes
- [ ] Create `modernization` branch
- [ ] Document any known issues

### 2. After Each Component Conversion
- [ ] Component renders correctly
- [ ] Props pass through correctly
- [ ] Event handlers work
- [ ] Redux selectors/dispatch work
- [ ] No console warnings

### 3. After Major Milestone
- [ ] Full regression test
- [ ] Performance check (React DevTools Profiler)
- [ ] Bundle size check

---

## Gotchas & Common Issues

### 1. Hook Rules
✅ **DO**: Call hooks at top level
❌ **DON'T**: Call hooks inside conditions/loops

```javascript
// WRONG
function Component({ show }) {
  if (show) {
    const [value, setValue] = useState(0); // ❌ Conditional hook
  }
}

// RIGHT
function Component({ show }) {
  const [value, setValue] = useState(0); // ✅ Always called
  if (!show) return null;
}
```

### 2. Stale Closures
```javascript
// WRONG
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(count + 1); // ❌ Captures initial count (0)
    }, 1000);
    return () => clearInterval(timer);
  }, []); // Empty deps = count never updates
}

// RIGHT
function Component() {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => prev + 1); // ✅ Uses current value
    }, 1000);
    return () => clearInterval(timer);
  }, []);
}
```

### 3. useEffect Deps
Always include ALL used variables in dependency array, or use ESLint plugin:
```bash
npm install eslint-plugin-react-hooks
```

### 4. Performance
Most components don't need optimization, but if needed:
```javascript
// Memoize expensive calculations
const result = useMemo(() => expensiveOperation(data), [data]);

// Memoize entire component
export default React.memo(MyComponent);

// Memoize callbacks
const handler = useCallback(() => doSomething(), [deps]);
```

---

## When NOT to Upgrade

**Stay on React 15 if:**
- App is stable and rarely changed
- Team is unfamiliar with hooks
- No time for testing/QA
- Other critical priorities

**You can always use modern patterns in NEW code** and leave old code as-is.

---

## Resources

- [React Hooks Docs](https://react.dev/reference/react)
- [Redux Toolkit Docs](https://redux-toolkit.js.org/)
- [React-Redux Hooks](https://react-redux.js.org/api/hooks)
- [useHooks.com](https://usehooks.com/) - Custom hooks collection
- [React DevTools](https://react.dev/learn/react-developer-tools) - For profiling

---

## Example File Reference

See `common/app/Map/Challenge-Modern-Example.jsx` for a complete side-by-side comparison of class vs hooks patterns.
