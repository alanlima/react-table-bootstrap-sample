import React, { useMemo } from 'react'

export function RecordCountCell({
    rows,
    recordsCountLabel = 'record(s)'
}) {
    return (<>{`${rows.length} ${recordsCountLabel}`}</>)
}

export function AggregateSumCell({
    rows,
    column: { id }
}) {
    const sumCount = useMemo(() => {
        let sumCount = rows.reduce((sum, next) => {
            const current = next.values[id];
            return sum + (typeof current === 'number' ? current : 0);
        }, 0);
        return sumCount;
    }, [rows, id]);

    return <>{sumCount}</>
}

export function LogPropsCell(props, other) {
    console.log('[log-cell]', {
        props, other
    });
    return null;
}