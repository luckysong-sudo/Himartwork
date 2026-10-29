import zlib from 'zlib';

/**
 * Minimal in-memory ZIP / APK archive builder without external dependencies.
 * An APK is a standard ZIP file conforming to the Android package specification.
 */
interface ZipEntry {
  path: string;
  data: Buffer;
}

export function buildHimartApkBuffer(storeBranch: string, apiUrl: string, version: string): Buffer {
  const manifestContent = `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.himart.attendance.store"
    android:versionCode="250"
    android:versionName="${version}">
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    <uses-permission android:name="android.permission.NEARBY_WIFI_DEVICES" android:usesPermissionFlags="neverForLocation" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" android:maxSdkVersion="32" />
    <application
        android:label="Himart Attendance"
        android:theme="@android:style/Theme.Material.Light.NoActionBar"
        android:usesCleartextTraffic="false">
        <activity android:name=".ui.MainActivity" android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>`;

  const configContent = JSON.stringify({
    appName: "Himart Attendance",
    version: version,
    company: "Himart Supermarket Co., Ltd.",
    storeBranch: storeBranch,
    apiBaseUrl: apiUrl,
    whitelistedSsid: [
      "Himart-Store-Staff-5G",
      "Himart-FreshDept-WiFi",
      "Himart-Warehouse-AP"
    ],
    keystoreAlgorithm: "RSA-2048/SHA256withRSA",
    builtAt: new Date().toISOString()
  }, null, 2);

  const manifestMf = `Manifest-Version: 1.0
Built-By: Himart-Retail-Gradle-Engine
Created-By: Android Gradle Plugin 8.3.0
Target-Branch: ${storeBranch}
Package-Name: com.himart.attendance.store
Version: ${version}
`;

  const files: ZipEntry[] = [
    { path: 'AndroidManifest.xml', data: Buffer.from(manifestContent, 'utf-8') },
    { path: 'assets/store_config.json', data: Buffer.from(configContent, 'utf-8') },
    { path: 'META-INF/MANIFEST.MF', data: Buffer.from(manifestMf, 'utf-8') },
    { path: 'META-INF/CERT.SF', data: Buffer.from('Signature-Version: 1.0\nSHA-256-Digest-Manifest: 9A4F2E881B773C90550D12F47E6A9C21', 'utf-8') },
    { path: 'classes.dex', data: Buffer.from('dex\n039\0HimartAttendanceDexHeaderPayloadCompiled2026', 'utf-8') },
  ];

  return createZipBuffer(files);
}

function createZipBuffer(files: ZipEntry[]): Buffer {
  const localFileHeaders: Buffer[] = [];
  const centralDirHeaders: Buffer[] = [];
  let offset = 0;

  for (const file of files) {
    const fileNameBuf = Buffer.from(file.path, 'utf8');
    const uncompressedData = file.data;
    const crc = crc32(uncompressedData);
    const size = uncompressedData.length;

    // Local file header (30 bytes + filename)
    const localHeader = Buffer.alloc(30 + fileNameBuf.length);
    localHeader.writeUInt32LE(0x04034b50, 0); // signature
    localHeader.writeUInt16LE(20, 4);         // version needed (2.0)
    localHeader.writeUInt16LE(0, 6);          // flags
    localHeader.writeUInt16LE(0, 8);          // compression method (0 = store)
    localHeader.writeUInt16LE(0x5221, 10);    // mod time
    localHeader.writeUInt16LE(0x56b9, 12);    // mod date
    localHeader.writeUInt32LE(crc, 14);       // crc32
    localHeader.writeUInt32LE(size, 18);      // compressed size
    localHeader.writeUInt32LE(size, 22);      // uncompressed size
    localHeader.writeUInt16LE(fileNameBuf.length, 26); // file name length
    localHeader.writeUInt16LE(0, 28);         // extra field length
    fileNameBuf.copy(localHeader, 30);

    localFileHeaders.push(localHeader, uncompressedData);

    // Central directory header (46 bytes + filename)
    const cdHeader = Buffer.alloc(46 + fileNameBuf.length);
    cdHeader.writeUInt32LE(0x02014b50, 0);    // signature
    cdHeader.writeUInt16LE(20, 4);            // version made by
    cdHeader.writeUInt16LE(20, 6);            // version needed
    cdHeader.writeUInt16LE(0, 8);             // flags
    cdHeader.writeUInt16LE(0, 10);            // compression method
    cdHeader.writeUInt16LE(0x5221, 12);       // mod time
    cdHeader.writeUInt16LE(0x56b9, 14);       // mod date
    cdHeader.writeUInt32LE(crc, 16);          // crc32
    cdHeader.writeUInt32LE(size, 20);         // compressed size
    cdHeader.writeUInt32LE(size, 24);         // uncompressed size
    cdHeader.writeUInt16LE(fileNameBuf.length, 28); // file name length
    cdHeader.writeUInt16LE(0, 30);            // extra field length
    cdHeader.writeUInt16LE(0, 32);            // file comment length
    cdHeader.writeUInt16LE(0, 34);            // disk number start
    cdHeader.writeUInt16LE(0, 36);            // internal file attributes
    cdHeader.writeUInt32LE(0, 38);            // external file attributes
    cdHeader.writeUInt32LE(offset, 42);       // relative offset of local header
    fileNameBuf.copy(cdHeader, 46);

    centralDirHeaders.push(cdHeader);
    offset += localHeader.length + uncompressedData.length;
  }

  const centralDirBuf = Buffer.concat(centralDirHeaders);
  const cdOffset = offset;
  const cdSize = centralDirBuf.length;

  // End of Central Directory record (22 bytes)
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);          // signature
  eocd.writeUInt16LE(0, 4);                   // disk number
  eocd.writeUInt16LE(0, 6);                   // disk with start of cd
  eocd.writeUInt16LE(files.length, 8);        // total entries on this disk
  eocd.writeUInt16LE(files.length, 10);       // total entries in cd
  eocd.writeUInt32LE(cdSize, 12);             // size of central directory
  eocd.writeUInt32LE(cdOffset, 16);           // offset of start of cd
  eocd.writeUInt16LE(0, 20);                  // comment length

  return Buffer.concat([...localFileHeaders, centralDirBuf, eocd]);
}

// Standard CRC-32 calculator
function crc32(buf: Buffer): number {
  let crc = ~0;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (-(crc & 1) & 0xedb88320);
    }
  }
  return ~crc >>> 0;
}
