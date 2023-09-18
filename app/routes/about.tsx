import type { HeadersFunction, MetaFunction } from "@remix-run/node";

export const meta: MetaFunction = () => {
  return [
    { title: "About | nichtsam" },
    {
      name: "description",
      content: "nichtsam! Sam! Samuel Jensen! Website! About Page!",
    },
  ];
};

export const headers: HeadersFunction = () => ({
  "Cache-Control": "private, max-age=3600",
  Vary: "Cookie",
});

export default function About() {
  return (
    <div className="h-full w-full">
      <section className="container mx-auto p-9">
        <article className="prose prose-neutral dark:prose-invert lg:prose-xl">
          <h1>About me</h1>
          <p>
            Hello there!
            <br />
          </p>
          <p>
            My name is Samuel Jensen, one developer with a multicultural
            background. I was born to German and Polish parents and grew up in
            Taiwan. This unique blend of cultures has shaped my perspective and
            instilled a deep appreciation for diversity. Language has always
            been something special to me. I am most fluent in Chinese, followed
            by English and German. Recently, I've grown a bit of interest in
            French. Unfortunately, Polish wasn't part of my upbringing, but I
            look forward to exploring it one day.
          </p>
          <p>
            I've always been a self-taught developer with a curiosity for
            technology. I love diving into various aspects of development,
            whether front-end, back-end, or even with CLIs and tooling. I like
            trying out different things and playing around with stuff to
            understand them. The versatility of the developing world continues
            to amaze and inspire me.
          </p>
          <p>
            My programming journey began with Typescript, which I've been using
            at work. While it's been a valuable experience, I'd like to step out
            there and get to know more. Currently, I'm exploring the world of
            Rust, uncovering its unique capabilities and potential applications.
            Learning new things and embracing endless possibilities is something
            I genuinely enjoy.
          </p>
          <p>
            I also go by the name "nichtsam". You can look me up on GitHub. Feel
            free to explore my repositories and see some weird things I've been
            working on. Thank you for visiting my corner of the digital world.
            I'm always excited to collaborate and connect with like-minded
            individuals, so feel free to reach out and share your thoughts or
            projects.
          </p>
        </article>
      </section>
    </div>
  );
}
