# mbts

Generate TypeScript type definitions (.d.ts) from MoonBit interface files (.mbti).

## Usage

```moonbit
let mbti = @tsnize.parse_mbti(content, "example.mbti")!
let dts = @tsnize.generate_dts(mbti)
```

## Development

```bash
# Install dependencies
moon update

# Run tests
moon test

# Run tests and update snapshots
moon test --update
```

## License

MIT
