namespace Deezer {
	const entityTypes = [
		'album',
		'artist',
	] as const;

	type EntityType = typeof entityTypes[number];
}
