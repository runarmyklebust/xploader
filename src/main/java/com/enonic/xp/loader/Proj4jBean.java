package com.enonic.xp.loader;

import javax.measure.quantity.Length;
import javax.measure.unit.SI;
import javax.measure.unit.Unit;

import org.jscience.geography.coordinates.LatLong;
import org.jscience.geography.coordinates.UTM;
import org.jscience.geography.coordinates.crs.CoordinatesConverter;

import com.enonic.xp.script.bean.BeanContext;
import com.enonic.xp.script.bean.ScriptBean;

public class Proj4jBean
    implements ScriptBean
{
    @Override
    public void initialize( final BeanContext context )
    {

    }

    public String fromUTM( final int longZone, final char latZone, final double easting, final double northing, final String unit )
    {
        Unit<Length> unitLength;

        if ( unit.toLowerCase().equals( "m" ) )
        {
            unitLength = SI.METER;
        }
        else if ( unit.toLowerCase().equals( "km" ) )
        {
            unitLength = SI.KILOMETRE;
        }
        else
        {
            throw new IllegalArgumentException( "Unknown unit [" + unit + "]" );
        }

        UTM utm = UTM.valueOf( longZone, latZone, easting, northing, unitLength );
        CoordinatesConverter<UTM, LatLong> utmToLatLong = UTM.CRS.getConverterTo( LatLong.CRS );
        LatLong latLong = utmToLatLong.convert( utm );

        final double[] coordinates = latLong.getCoordinates();

        return coordinates[0] + "," + coordinates[1];
    }


    public static void main( String... args )
    {
        final Proj4jBean bean = new Proj4jBean();
        System.out.println( bean.fromUTM( 33, 'N', -31210.00, 6558814, "M" ) );
    }


}
