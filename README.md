# BRCA Multi-Omics Integration Recommender

An interactive web resource for exploring multi-omics combinations and integration algorithms based on a TCGA-BRCA benchmark.

The web interface presents precomputed benchmark results, allowing users to explore candidate multi-omics combinations, examine their relative performance and stability, and review the integration algorithms evaluated for each combination.

## Web App

https://ivyzxr.github.io/BRCA-MultiOmics-Recommender/

## Workflow

1. Select available omics data types.
2. Review and evaluate compatible multi-omics combinations.
3. Review integration algorithms evaluated for the selected combination.
4. View algorithm information and benchmark metrics.

## Related Manuscript

This web resource accompanies the manuscript currently in preparation:

*Benchmark of multi-omics combinations reveals breast cancer–specific integration strategies.*

Publication information and DOI will be added after publication.

## Analysis Code

The analysis code used to generate the benchmark rankings, evaluation results, bootstrap stability analysis, and recommendation tables is available at:

https://github.com/Ivyzxr/BRCA-Omics-Combination-Recommendation

## Benchmark Data

The benchmark was conducted using matched multi-omics samples from the **TCGA Breast Invasive Carcinoma (TCGA-BRCA)** cohort.

Six omics data types were considered:

- **CNV** — Copy Number Variation
- **MET** — DNA Methylation
- **MIR** — miRNA Expression
- **RNA** — mRNA Expression
- **PRO** — Protein Expression
- **SNP** — Somatic Mutation

PAM50 breast cancer subtypes were used as the primary external subtype reference for evaluating clustering concordance.

## Evaluated Integration Algorithms

The benchmark includes five multi-omics integration algorithms:

- **BCC**
- **iClusterBayes**
- **LRAcluster**
- **PINSPlus**
- **Similarity Network Fusion (SNF)**

Because not all algorithms support the same input data types, the web interface displays only the algorithms evaluated for each selected combination.

## Benchmark Framework

Multi-omics combinations were evaluated using PAM50 concordance together with clinical association and survival-related criteria.

Combination rankings were first derived within each algorithm and subsequently summarized across supporting algorithms using normalized ranks. Bootstrap resampling was additionally used to assess the stability and uncertainty of the resulting rankings.

Detailed methodology and analysis code are provided in the associated analysis repository and manuscript.

## Scope and Limitations

The rankings represent relative performance within the TCGA-BRCA benchmark and may vary across datasets, preprocessing strategies, patient populations, and analysis settings.

This web resource is intended for interactive exploration of the precomputed benchmark results rather than establishing universal superiority of a particular multi-omics combination or integration algorithm.
