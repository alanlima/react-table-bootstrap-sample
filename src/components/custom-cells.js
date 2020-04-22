import React from 'react';

export function ColumnSummaryCell({
    column: { columnSummary, columnSummaryValue }
}) {
    if(!columnSummary) return null;
    return <>{columnSummaryValue}</>
}

export function LogPropsCell(props, other) {
    console.log('[log-cell]', {
        props, other
    });
    return null;
}