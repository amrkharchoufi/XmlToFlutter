<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
  <xsl:output method="text" indent="yes"/>

  <xsl:template match="/UIComponent">
    <xsl:apply-templates select="*"/>
  </xsl:template>

  <xsl:template match="Column">
    <xsl:text>Column(
  mainAxisAlignment: MainAxisAlignment.</xsl:text>
    <xsl:value-of select="@mainAxisAlignment"/>
    <xsl:text>,
  crossAxisAlignment: CrossAxisAlignment.</xsl:text>
    <xsl:value-of select="@crossAxisAlignment"/>
    <xsl:if test="@backgroundColor != '#FFFFFF'">
      <xsl:text>,
  backgroundColor: Color(0x</xsl:text>
      <xsl:value-of select="substring(@backgroundColor, 2)"/>
      <xsl:text>)</xsl:text>
    </xsl:if>
    <xsl:text>,
  children: [
    </xsl:text>
    <xsl:apply-templates select="*"/>
    <xsl:text>
  ],
)</xsl:text>
  </xsl:template>

  <xsl:template match="Row">
    <xsl:text>Row(
  mainAxisAlignment: MainAxisAlignment.</xsl:text>
    <xsl:value-of select="@mainAxisAlignment"/>
    <xsl:text>,
  crossAxisAlignment: CrossAxisAlignment.</xsl:text>
    <xsl:value-of select="@crossAxisAlignment"/>
    <xsl:if test="@backgroundColor != '#FFFFFF'">
      <xsl:text>,
  backgroundColor: Color(0x</xsl:text>
      <xsl:value-of select="substring(@backgroundColor, 2)"/>
      <xsl:text>)</xsl:text>
    </xsl:if>
    <xsl:text>,
  children: [
    </xsl:text>
    <xsl:apply-templates select="*"/>
    <xsl:text>
  ],
)</xsl:text>
  </xsl:template>

  <xsl:template match="Text">
    <xsl:text>Text(
  '</xsl:text>
    <xsl:value-of select="@value"/>
    <xsl:text>',
  style: TextStyle(
    fontSize: </xsl:text>
    <xsl:value-of select="@fontSize"/>
    <xsl:text>,
    color: Color(0x</xsl:text>
    <xsl:value-of select="substring(@color, 2)"/>
    <xsl:text>),
  ),
)</xsl:text>
  </xsl:template>

  <xsl:template match="Button">
    <xsl:text>ElevatedButton(
  onPressed: () {},
  style: ElevatedButton.styleFrom(
    backgroundColor: Color(0x</xsl:text>
    <xsl:value-of select="substring(@color, 2)"/>
    <xsl:text>),
  ),
  child: Text('</xsl:text>
    <xsl:value-of select="@text"/>
    <xsl:text>'),
)</xsl:text>
  </xsl:template>

  <xsl:template match="Input">
    <xsl:text>TextField(
  decoration: InputDecoration(
    hintText: '</xsl:text>
    <xsl:value-of select="@placeholder"/>
    <xsl:text>',
    filled: true,
    fillColor: Color(0x</xsl:text>
    <xsl:value-of select="substring(@backgroundColor, 2)"/>
    <xsl:text>),
  ),
  style: TextStyle(
    fontSize: </xsl:text>
    <xsl:value-of select="@fontSize"/>
    <xsl:text>,
    color: Color(0x</xsl:text>
    <xsl:value-of select="substring(@textColor, 2)"/>
    <xsl:text>),
  ),
)</xsl:text>
  </xsl:template>
</xsl:stylesheet>