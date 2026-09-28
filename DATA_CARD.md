# Data Card - CycloNerveAI Coastal Incident Intelligence

## 1. Dataset Overview

CycloNerveAI integrates multi-source geospatial, meteorological, and infrastructural data streams to model coastal lifelines and cyclone cascades in eastern India (Odisha coastal districts: Bhadrak, Kendrapara, Jagatsinghpur, Balasore).

| Dataset Stream | Source Organization | Physical Domain | Resolution / Format | Primary Use in CycloNerveAI |
| :--- | :--- | :--- | :--- | :--- |
| **Cyclone Track & Intensity** | IMD (India Meteorological Dept) / JTWC | Meteorology | 3-hour forecasts, storm center $(lat, lng)$, central pressure ($hPa$), sustained wind ($km/h$) | Hazard Factor ($H$), surge boundary forcing |
| **SAR Flood Inundation** | Copernicus Sentinel-1 C-SAR via Google Earth Engine | Earth Observation | 10-meter spatial resolution, GeoTIFF, VV/VH backscatter polarization | Spatial inundation extent, flood depth verification |
| **Coastal Topography (DEM)** | NASA SRTM / ISRO Cartosat | Elevation | 30-meter grid, vertical elevation in meters MSL | Storm surge overtopping calculation vs floodwalls |
| **Power Transmission Assets** | OPTCL (Odisha Power Transmission Corp Ltd) | Infrastructure | Substation nodes (220kV/132kV/33kV), transmission lines, transformer bay elevations | Dependency Graph root nodes, CERC statutory breach triggers |
| **Lifeline Facilities** | Health Dept, Port Trust, Telecom Providers | Infrastructure | Hospital coordinates, ICU bed capacities, port berths, microwave backhaul towers | Dependency Graph sink nodes, cascade failure propagation |
| **Population Density Grid** | Census of India / WorldPop | Demographics | 100-meter gridded population estimates | Exposure Factor ($E$), evacuation prioritization |

---

## 2. Data Provenance & Synthetic Scenarios

### Scenario Baseline: Cyclone Samudra (Category 4 Coastal Landfall)
- **Classification:** `simulated` / `derived`
- **Simulation Flag:** All demonstration scenario assets and records maintain an immutable boolean flag: `isSimulated: true`.
- **Purpose:** Enables rigorous operational training, stress testing, and counterfactual validation for emergency operations centers without broadcasting spurious live alerts.
- **Physical Calibration:** Synthetic parameters are calibrated against historical benchmarks from Very Severe Cyclonic Storms (VSCS) and Super Cyclones in the Bay of Bengal (e.g., Cyclone Fani 2019, 1999 Odisha Super Cyclone).

---

## 3. Data Ingestion & Transformation Pipeline

```
+------------------------------------+      +-----------------------------------+
|  Satellite SAR (Sentinel-1 VV/VH)  |      |   IMD Bulletins & Cyclone Track   |
+-----------------+------------------+      +-----------------+-----------------+
                  |                                           |
                  v                                           v
+------------------------------------+      +-----------------------------------+
| EarthEngineCloudAdapter / Mock     |      | BigQueryCloudAdapter / Mock       |
| - Bounding box filtering           |      | - Geospatial asset buffer queries |
| - Backscatter thresholding (dB)    |      | - Population exposure grids       |
+-----------------+------------------+      +-----------------+-----------------+
                  \                                           /
                   \                                         /
                    v                                       v
         +-----------------------------------------------------+
         |         Deterministic Provenance Validator          |
         |  - Verification of data freshness and timestamps   |
         |  - Strict schema boundary validation                |
         |  - Unambiguous 'isSimulated' flag enforcement       |
         +--------------------------+--------------------------+
                                    |
                                    v
         +-----------------------------------------------------+
         |      Composite Risk Engine & Cascade Propagation    |
         +-----------------------------------------------------+
```

---

## 4. Bias, Limitations & Ethical Considerations

1. **Topographic Smoothing:** 30-meter elevation models may underestimate localized micro-topography, micro-drainage channels, or newly constructed embankments. Ground-truth field evidence submission is supported to reconcile model offsets.
2. **Rural Telecom Vulnerability:** Cellular broadcast availability depends on tower battery and generator backup life (typically 4–8 hours under grid blackout). The cascade engine explicitly models telecom battery depletion as a second-order failure.
3. **No Personally Identifiable Information (PII):** Population grids are aggregated at the demographic block level; no individual citizen records or PII are stored or ingested.
4. **Offline Resilience:** If cloud data pipelines become unreachable due to transoceanic fiber damage, local cached snapshots ensure seamless continuity under `TIER_3_AIRGAPPED_EDGE`.
