/**
 * ============================================================
 * Card — Demonstrates BOTH Stateless AND Stateful versions
 * ============================================================
 * LESSON EXERCISE:
 *   "Create Stateless AND Stateful component for Card component
 *    that can receive title and description as props."
 *
 * LESSON CONCEPT APPLIED:
 *   ✅ Stateless Component (Functional):
 *      "Stateless components obviously have no state."
 *
 *   ✅ Stateful Component (Class):
 *      "Stateful components can hold state."
 *
 *   ✅ Props:
 *      "Props are set by the parent and fixed throughout the
 *       lifetime of a component."
 *
 *   ✅ PropTypes (runtime validation)
 *
 *   ✅ Requiring Single Child:
 *      "With PropTypes.element you can specify that only a
 *       single child can be passed to a component as children."
 *      (Shown in StatefulCard for demonstration.)
 *
 *   ✅ Mounting Lifecycle (in StatefulCard):
 *      constructor() → render() → componentDidMount()
 *
 *   ✅ Unmounting Lifecycle:
 *      componentWillUnmount()
 * ============================================================
 */

import React from "react";
import PropTypes from "prop-types";
import type { CardProps } from "../types";
import "../styles/Card.css";

/* ──────────────────────────────────────────────────────────── */
/* 1. STATELESS Card (Functional Component)                    */
/* ──────────────────────────────────────────────────────────── */
export const StatelessCard: React.FC<CardProps> = ({
  title,
  description,
  children,
}) => {
  /**
   * WHY Stateless?
   * This card only *displays* data passed via props.
   * It has no internal data to manage, so a function component
   * is the simplest and most efficient choice.
   */
  return (
    <div className="card">
      <h3 className="card__title">{title}</h3>
      <p className="card__description">{description}</p>
      {children && <div className="card__body">{children}</div>}
    </div>
  );
};

StatelessCard.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.node,
};

/* ──────────────────────────────────────────────────────────── */
/* 2. STATEFUL Card (Class Component)                          */
/* ──────────────────────────────────────────────────────────── */
interface StatefulCardState {
  /** Track how many times the card has been rendered */
  renderCount: number;
  /** Timestamp when the card was mounted */
  mountedAt: string;
}

export class StatefulCard extends React.Component<CardProps, StatefulCardState> {
  /**
   * ─── MOUNTING: constructor() ───────────────────────────
   * Lesson: "constructor() is called first when an instance
   * of a component is being created and inserted into the DOM."
   *
   * WHY? We initialise state here.
   * Lesson: "State is data maintained inside a component.
   *          It is local or owned by that specific component."
   */
  constructor(props: CardProps) {
    super(props);
    this.state = {
      renderCount: 0,
      mountedAt: "",
    };
    console.log("[StatefulCard] constructor() — state initialised");
  }

  /**
   * ─── MOUNTING: componentDidMount() ─────────────────────
   * Lesson: "This method is a good place to set up any
   * subscriptions."
   *
   * WHY? It runs once after the component first renders
   * into the DOM. Perfect for timers, API calls, etc.
   */
  componentDidMount(): void {
    this.setState({ mountedAt: new Date().toLocaleTimeString() });
    console.log("[StatefulCard] componentDidMount() — card is in the DOM");
  }

  /**
   * ─── UPDATING: componentDidUpdate() ────────────────────
   * Lesson: "An update can be caused by changes to props
   * or state."
   */
  componentDidUpdate(
    _prevProps: CardProps,
    prevState: StatefulCardState
  ): void {
    if (prevState.renderCount !== this.state.renderCount) {
      console.log(
        `[StatefulCard] componentDidUpdate() — renderCount changed to ${this.state.renderCount}`
      );
    }
  }

  /**
   * ─── UNMOUNTING: componentWillUnmount() ────────────────
   * Lesson: "This method is called when a component is being
   * removed from the DOM."  / "don't forget to unsubscribe
   * in componentWillUnmount()."
   */
  componentWillUnmount(): void {
    console.log("[StatefulCard] componentWillUnmount() — cleaning up");
  }

  /**
   * Increment render count.
   * Lesson: "Always use setState" — never mutate this.state directly.
   * We use the callback form: setState((prevState) => ...)
   * to safely reference the previous value.
   */
  handleClick = (): void => {
    this.setState((prevState) => ({
      renderCount: prevState.renderCount + 1,
    }));
  };

  /**
   * ─── MOUNTING / UPDATING: render() ─────────────────────
   * Lesson: "render() is called during both Mounting and
   * Updating phases."
   */
  render(): React.ReactNode {
    const { title, description, children } = this.props;
    const { renderCount, mountedAt } = this.state;

    return (
      <div className="card card--stateful">
        <h3 className="card__title">{title}</h3>
        <p className="card__description">{description}</p>
        <p className="card__meta">
          Mounted at: {mountedAt} | Clicks: {renderCount}
        </p>
        <button className="card__btn" onClick={this.handleClick} type="button">
          Click me (updates state)
        </button>
        {children && <div className="card__body">{children}</div>}
      </div>
    );
  }
}

/**
 * PropTypes for the class component.
 * Lesson: PropTypes works the same way on class components.
 */
(StatefulCard as unknown as { propTypes: Record<string, unknown> }).propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  children: PropTypes.node,
};

export default StatelessCard;
