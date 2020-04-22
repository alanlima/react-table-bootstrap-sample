import React, { useMemo } from 'react';

import * as aggregationFormulas from '../utils/aggregations';

const allAggregations = {
    'sum': aggregationFormulas.sum,
    'min': aggregationFormulas.min,
    'max': aggregationFormulas.max,
    'minMax': aggregationFormulas.minMax,
    'average': aggregationFormulas.average,
    'median': aggregationFormulas.median,
    'unique': aggregationFormulas.unique,
    'uniqueCount': aggregationFormulas.uniqueCount,
    'count': aggregationFormulas.count
}

const log = (...what) => console.info('%c [useAggregations]', 'background: #222; color: #bada55', ...what);

function useInstance(instance) {
    const {
        rows,
        allColumns
    } = instance;

    // Execute the procedures to summarise the columns.
    // Just need to execute once for each rows, allColumns combination.
    // The result is stored in the column columnSummaryValue
    useMemo(() => {
        allColumns.forEach(column => {
            const { columnSummary } = column;

            if(columnSummary) {
                const values = rows.map(row => row.values[column.id]);
                const formulas = typeof(columnSummary) === 'object'
                                    ? [...columnSummary]
                                    : [columnSummary]
    
                column.columnSummaryValue = reduceFormulas(values, formulas);
            }
        });
    }, [rows, allColumns]);
}

function reduceFormulas(values, formulas) {
    return formulas
        .map(fn => 
            typeof(fn) === 'string'
                ? allAggregations[fn] || ((_ => 0))
                : fn)
        .reduce((prev, nextFormula) => nextFormula(prev), values);
}

export default function useColumnSummary(hooks) {
    log('init', { hooks });

    hooks.useInstance.push(useInstance);
}

