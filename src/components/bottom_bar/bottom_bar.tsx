/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */

import classNames from 'classnames';
import React, {
  CSSProperties,
  forwardRef,
  HTMLAttributes,
  useEffect,
  useState,
} from 'react';
import { useCombinedRefs, useEuiTheme } from '../../services';
import { EuiScreenReaderOnly } from '../accessibility';
import { CommonProps, ExclusiveUnion } from '../common';
import { EuiI18n } from '../i18n';
import { useResizeObserver } from '../observer/resize_observer';
import { EuiPortal, EuiPortalProps } from '../portal';
import { euiBottomBarStyles } from './bottom_bar.styles';
import { EuiThemeProvider } from '../../services/theme/provider';

type BottomBarPaddingSize = 'none' | 's' | 'm' | 'l';

// Exported for testing
export const paddingSizeToClassNameMap: {
  [value in BottomBarPaddingSize]: string | null;
} = {
  none: null,
  s: 'euiBottomBar--paddingSmall',
  m: 'euiBottomBar--paddingMedium',
  l: 'euiBottomBar--paddingLarge',
};

export const POSITIONS = ['static', 'fixed', 'sticky'] as const;
export type _BottomBarPosition = typeof POSITIONS[number];

type _BottomBarExclusivePositions = ExclusiveUnion<
  {
    position?: 'fixed';
    /**
     * Whether to wrap in an EuiPortal which appends the component to the body element.
     * Only works if `position` is `fixed`.
     */
    usePortal?: boolean | EuiPortalProps;
    /**
     * Whether the component should apply padding on the document body element to afford for its own displacement height.
     * Only works if `usePortal` is true and `position` is `fixed`.
     */
    affordForDisplacement?: boolean;
  },
  {
    /**
     * How to position the bottom bar against its parent.
     */
    position: 'static' | 'sticky';
  }
>;
export type EuiBottomBarProps = CommonProps &
  HTMLAttributes<HTMLElement> &
  _BottomBarExclusivePositions & {
    /**
     * Padding applied to the bar. Default is 'm'.
     */
    paddingSize?: BottomBarPaddingSize;
    /**
     * Optional class applied to the body element on mount.
     */
    bodyClassName?: string;
    /**
     * Customize the screen reader heading that helps users find this control. Default is 'Page level controls'.
     */
    landmarkHeading?: string;
    /**
     * Starting vertical position when `fixed` position.
     * Offset from the top of the window when `sticky` position.
     * Has no affect on `static` positions.
     */
    top?: CSSProperties['top'];
    /**
     * Ending horizontal position when `fixed` position.
     * Has no affect on `static` or `sticky` positions.
     */
    right?: CSSProperties['right'];
    /**
     * Starting vertical position when `fixed` position.
     * Offset from the bottom of the window when `sticky` position.
     * Has no affect on `static` positions.
     */
    bottom?: CSSProperties['bottom'];
    /**
     * Starting horizontal position when `fixed` position.
     * Has no affect on `static` or `sticky` positions.
     */
    left?: CSSProperties['left'];
  };

const _EuiBottomBar = forwardRef<
  HTMLElement, // type of element or component the ref will be passed to
  EuiBottomBarProps // what properties apart from `ref` the component accepts
>(
  (
    {
      position = 'fixed',
      paddingSize = 'm',
      affordForDisplacement = true,
      children,
      className,
      bodyClassName,
      landmarkHeading,
      usePortal = true,
      left = 0,
      right = 0,
      bottom = 0,
      top,
      style,
      ...rest
    },
    ref
  ) => {
    const euiTheme = useEuiTheme();
    const styles = euiBottomBarStyles(euiTheme);

    // Force some props if `fixed` position, but not if the user has supplied these
    affordForDisplacement =
      position !== 'fixed' ? false : affordForDisplacement;
    usePortal = position !== 'fixed' ? false : usePortal;

    const [resizeRef, setResizeRef] = useState<HTMLElement | null>(null);
    const setRef = useCombinedRefs([setResizeRef, ref]);
    // TODO: Allow this hooke to be conditional
    const dimensions = useResizeObserver(resizeRef);

    useEffect(() => {
      if (affordForDisplacement && usePortal) {
        document.body.style.paddingBottom = `${dimensions.height}px`;
      }

      if (bodyClassName) {
        document.body.classList.add(bodyClassName);
      }

      return () => {
        if (affordForDisplacement && usePortal) {
          document.body.style.paddingBottom = '';
        }

        if (bodyClassName) {
          document.body.classList.remove(bodyClassName);
        }
      };
    }, [affordForDisplacement, usePortal, dimensions, bodyClassName]);

    const classes = classNames(
      'euiBottomBar',
      `euiBottomBar--${position}`,
      paddingSizeToClassNameMap[paddingSize],
      className
    );

    const cssStyles = [
      styles.euiBottomBar,
      styles[position],
      styles[paddingSize],
      { position },
    ];

    const newStyle = {
      left,
      right,
      bottom,
      top,
      ...style,
    };

    const bar = (
      <>
        <EuiI18n
          token="euiBottomBar.screenReaderHeading"
          default="Page level controls"
        >
          {(screenReaderHeading: string) => (
            // Though it would be better to use aria-labelledby than aria-label and not repeat the same string twice
            // A bug in voiceover won't list some landmarks in the rotor without an aria-label

            <section
              aria-label={
                landmarkHeading ? landmarkHeading : screenReaderHeading
              }
              className={classes}
              css={cssStyles}
              ref={setRef}
              style={newStyle}
              {...rest}
            >
              <EuiScreenReaderOnly>
                <h2>
                  {landmarkHeading ? landmarkHeading : screenReaderHeading}
                </h2>
              </EuiScreenReaderOnly>
              {children}
            </section>
          )}
        </EuiI18n>
        <EuiScreenReaderOnly>
          <p aria-live="assertive">
            {landmarkHeading ? (
              <EuiI18n
                token="euiBottomBar.customScreenReaderAnnouncement"
                default="There is a new region landmark called {landmarkHeading} with page level controls at the end of the document."
                values={{ landmarkHeading }}
              />
            ) : (
              <EuiI18n
                token="euiBottomBar.screenReaderAnnouncement"
                default="There is a new region landmark with page level controls at the end of the document."
              />
            )}
          </p>
        </EuiScreenReaderOnly>
      </>
    );

    return usePortal ? (
      <EuiPortal {...(typeof usePortal !== 'boolean' ? usePortal : undefined)}>
        {bar}
      </EuiPortal>
    ) : (
      bar
    );
  }
);

export const EuiBottomBar = forwardRef<HTMLElement, EuiBottomBarProps>(
  (props, ref) => {
    const BottomBar = _EuiBottomBar;
    return (
      <EuiThemeProvider colorMode={'dark'}>
        <BottomBar ref={ref} {...props} />
      </EuiThemeProvider>
    );
  }
);

EuiBottomBar.displayName = 'EuiBottomBar';
_EuiBottomBar.displayName = 'EuiBottomBar';
