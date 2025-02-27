/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0 and the Server Side Public License, v 1; you may not use this file except
 * in compliance with, at your election, the Elastic License 2.0 or the Server
 * Side Public License, v 1.
 */
import { css } from '@emotion/react';
import { UseEuiTheme } from '../../../services';
import { logicalCSS } from '../../../global_styling';

export const euiButtonDisplayContentStyles = ({ euiTheme }: UseEuiTheme) => ({
  // Base
  euiButtonDisplayContent: css`
    ${logicalCSS('height', '100%')};
    ${logicalCSS('width', '100%')};
    display: flex;
    justify-content: center;
    align-items: center;
    vertical-align: middle;
    gap: ${euiTheme.size.s};
  `,
  // Icon side
  left: css``,
  right: css`
    flex-direction: row-reverse;
  `,
  euiButtonDisplayContent__spinner: css`
    flex-shrink: 0;
  `,
  euiButtonDisplayContent__icon: css`
    flex-shrink: 0;
  `,
});
