import React from 'react'

export function RecordCountCell({
    rows,
    recordsCountLabel = 'record(s)'
}) {
    return (<>{`${rows.length} ${recordsCountLabel}`}</>)
}

export function LogPropsCell(props, other) {
    console.log('[log-cell]', {
        props, other
    });
    return null;
}