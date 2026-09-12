import { Buffer } from 'node:buffer';
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
const paths = [
    '/assets/Foto Bareng.webp',
    '/assets/People%201.webp',
    '/assets/People%202.webp',
    '/assets/People%203.webp',
    '/assets/admin-avatar.jpg',
    '/assets/admin-avatar.webp',
    '/assets/hero-consultant.png',
    '/assets/logos/ipb.png',
    '/assets/logos/itb.png',
    '/assets/logos/its.png',
    '/assets/logos/nottingham.png',
    '/assets/logos/stuttgart.png',
    '/assets/logos/ugm.webp',
    '/assets/logos/ui.png',
    '/assets/logos/undip.png',
    '/assets/nina.png',
    '/assets/pasted-1788585564773-0.webp',
    '/assets/reviews/ayu.webp',
    '/assets/reviews/nadia.webp',
    '/assets/reviews/rani.webp',
    '/assets/reviews/uly.webp',
    '/assets/reviews/widya.webp',
    '/assets/reviews/yohanes.webp',
    '/assets/testimoni iyha.mp4',
    '/assets/toefl1.webp',
    '/assets/toefl2.webp',
    '/assets/toefl3.webp',
    '/assets/toefl4.webp',
    '/assets/toefl5.webp',
    '/assets/toefl6.webp',
    '/assets/toefl7.webp',
    '/assets/toefl9.webp',
    '/assets/unair.webp',
    '/lms/lms-1.webp',
    '/lms/lms-2.webp',
    '/lms/lms-3.webp',
    '/lms/lms-4.webp',
    '/lms/lms-5.webp',
    '/lms/lms-6.webp',
    '/lms/lms-7.webp',
];
paths.push('/logo/Logo-Fullbright.webp');

for (let i = 0; i < paths.length; i += 6) {
    await Promise.all(
        paths.slice(i, i + 6).map(async (url) => {
            const dest = path.join('public', decodeURIComponent(url));

            try {
                await access(dest);

                return;
            } catch {
                /* Download missing assets. */
            }

            const response = await fetch(
                `https://toefl.fullbrightindonesia.org${encodeURI(decodeURIComponent(url))}`,
            );

            if (!response.ok) {
                throw new Error(`${url}: ${response.status}`);
            }

            await mkdir(path.dirname(dest), { recursive: true });
            await writeFile(dest, Buffer.from(await response.arrayBuffer()));
            console.log(url);
        }),
    );
}
