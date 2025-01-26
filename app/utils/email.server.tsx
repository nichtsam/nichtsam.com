import { render } from '@react-email/components'
import { Resend } from 'resend'
import MagicLinkEmail from '#app/components/emails/magic-link.tsx'
import { db } from './db.server'
import { env } from './env.server'

const resend = new Resend(env.RESEND_API_KEY)

export async function sendMagicLinkEmail({
	email,
	magicLink,
}: {
	email: string
	magicLink: string
	domain: string
}) {
	const subject = `🎩 Here's your magic link for nichtsam.com`
	const from = 'nichtsam <hello@nichtsam.com>'
	const to = email

	const user = await db.query.userTable.findFirst({
		where: (record, { eq }) => eq(record.email, email),
	})

	const react = <MagicLinkEmail magicLink={magicLink} user={user} />

	await resend.emails.send({
		subject,
		from,
		to,
		react,
		text: await render(react, { plainText: true }),
	})
}
