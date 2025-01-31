export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const lat = searchParams.get("lat") || "59.911491"; // Default: Oslo
    const lon = searchParams.get("lon") || "10.757933";
  
    const url = `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${lat}&lon=${lon}`;
  
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "DiskGolfApp/1.0 (saidhussainkhwajazada@gmail.com)", 
          "Accept": "application/json",
        },
        cache: "no-store",
      });
  
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }
  
      const data = await response.json();
      const timeseries = data.properties.timeseries[0];
  
      let symbolCode = "not available";
      if (timeseries?.data?.next_1_hours?.summary?.symbol_code) {
        symbolCode = timeseries.data.next_1_hours.summary.symbol_code;
      } else if (timeseries?.data?.next_6_hours?.summary?.symbol_code) {
        symbolCode = timeseries.data.next_6_hours.summary.symbol_code;
      } else if (timeseries?.data?.next_12_hours?.summary?.symbol_code) {
        symbolCode = timeseries.data.next_12_hours.summary.symbol_code;
      }
  
      return new Response(JSON.stringify({
        temperature: timeseries.data.instant.details.air_temperature,
        windSpeed: timeseries.data.instant.details.wind_speed,
        condition: symbolCode.replace("_", " "),
        updatedAt: new Date(data.properties.meta.updated_at).toISOString(),
      }), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
  
    } catch (error) {
      return new Response(JSON.stringify({ error: (error as Error).message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
  