 {/*
          <div
            className="svg-container"
            style={{
              transform: `scale(${scale})`,
              transformOrigin: `${origin.x}% ${origin.y}%`,
              minHeight: '100vh',
              position: 'relative',
            }}
            onClick={handleMapClick}
            ref={mapRef}
          >
       
            <div dangerouslySetInnerHTML={{ __html: chinaSvg }} />

    
            <div
              className="marker-container"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 10, 
              }}
            >
              {markedRegions.map(regionId => {
                const coord = COORDINATES[regionId];
                if (!coord) {
                  console.warn(`⚠️ COORDINATES 中未找到 ${regionId}`);
                  return null;
                }
                return (
                  <img
                    key={regionId}
                    src={pointImg}
                    className="location-marker"
                    style={{
                      position: 'absolute',
                      left: `${coord[0]}%`,
                      top: `${coord[1]}%`,
                      transform: 'translate(-50%, -50%)',
                      width: '24px',
                      height: '24px',
                    
                      zIndex: 20, //  显示在最上层
                    }}
                    alt="标记点"
                  />
                );
              })}
            </div>
          </div>*/}
          {/* 替换掉原 SVG 地图，改用高德地图容器 */}